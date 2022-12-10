require "aws-sdk-s3"
require "json"
require "net/http"
require "open3"
require "pathname"
require "tmpdir"
require "uri"

$:.unshift(File.expand_path("./rubyzip"))  # `npm run bundle` puts rubyzip there
require "zip"

SUCCESS = "SUCCESS"
FAILED = "FAILED"

$s3 = Aws::S3::Client.new()

def handler(event:, context:)
    begin
        # read properties
        request_type = event["RequestType"]
        properties = event["ResourceProperties"]
        preinstall_commands = properties["PreinstallCommands"]
        commands = properties["Commands"]
        packaged_directory = properties["PackagedDirectory"]
        asset_bucket = properties["AssetBucket"]
        asset_key = properties["AssetKey"]
        target_bucket = properties["BucketName"]

        puts(request_type)
        puts(properties)

        # setup home
        FileUtils.mkdir_p("/tmp/home")
        ENV["HOME"] = "/tmp/home"
        ENV["PATH"] += ":/tmp/home/.local/bin"

        # cancel custom resource on timeout because lambda runs up to 15 minutes, but custom resource waits for an hour
        Thread.new {
            sleep((context.get_remaining_time_in_millis() / 1000) - 5)
            send_response(event, context, FAILED, {}, "ERROR", "Lambda timed out. Try using CodeBuild packager instead.")
        }

        # handle request
        if request_type == "Create" || request_type == "Update"
            begin
                key = install(event, context, asset_bucket, asset_key, preinstall_commands + commands, packaged_directory, target_bucket)
                send_response(event, context, SUCCESS, {}, key)
            rescue => error
                send_response(event, context, FAILED, {}, "ERROR", error.message)
            end

        elsif request_type == "Delete"
            key = event["PhysicalResourceId"]
            begin
                $s3.delete_object({bucket: target_bucket, key: key})
            rescue => error
                puts("Unable to delete package: #{e}")
            end
            send_response(event, context, SUCCESS, {}, key)

        else
            send_response(event, context, FAILED, {}, "ERROR", "Bad request type")
        end

    rescue => error
        puts(error)
        send_response(event, context, FAILED, {}, "ERROR", "Internal error: #{error.message}")
    end
end

def install(event, context, asset_bucket, asset_key, commands, packaged_directory, target_bucket)
    temp = Dir.mktmpdir("package-", "/tmp")
    at_exit { FileUtils.remove_entry(dir) }

    # extract asset with requirements file
    puts("Downloading and unpacking asset...")

    asset_path = File.join(temp, "asset.zip")
    $s3.get_object({bucket: asset_bucket, key: asset_key}, target: asset_path)
    Zip::File.open(asset_path) do |zip_file|
      zip_file.each do |f|
        f_path = File.join(temp, f.name)
        FileUtils.mkdir_p(File.dirname(f_path))
        zip_file.extract(f, f_path) unless File.exist?(f_path)
      end
    end

    # run installation commands
    puts("Running installation commands...")

    commands.each do |command|
        begin
            puts(command)
            output, exit_code = Open3.capture2e(command, :chdir=>temp)
            print(output)
            if exit_code != 0
                if output.length > 500
                    output = "..." + output[-500..]
                end
                raise StandardError.new("COMMAND FAILED #{command}\n#{output}")
            end
        rescue => error
            raise StandardError.new("COMMAND FAILED #{command}\n#{error.message}")
        end
    end

    # zip it up
    puts("Packaging dependencies...")

    package_path = File.join(temp, "package.zip")
    Zip::File.open(package_path, create: true) do |zip_file|
      Dir[ File.join(temp, packaged_directory, "**", "**") ].each do |file|
        rel_file = Pathname.new(file).relative_path_from(temp).to_s
        zip_file.add(rel_file, file)
      end
    end

    # hash the zip
    puts("Hashing package...")

    package_hash_output, package_hash_exit_code = Open3.capture2("sha256sum #{package_path}")
    if package_hash_exit_code != 0
        raise StandardError.new("Unable to hash package")
    end
    package_hash = package_hash_output.split()[0]
    # try:
    #     $s3.head_object(Bucket=target_bucket, Key=f"{zip_hash}.zip")
    # except:
    #     # TODO if exists, don't upload
    #     pass

    # upload
    puts("Uploading package...")
    File.open(package_path, "rb") do |package|
        $s3.put_object(bucket: target_bucket, key: "#{package_hash}.zip", body: package)
    end

    return "#{package_hash}.zip"

end

# thanks https://github.com/tongueroo/cfnresponse/blob/359f6f9/lib/cfnresponse.rb

class Error < StandardError; end

# Debugging puts kept to help debug custom resources
def send_response(event, context, response_status, response_data={}, physical_id="PhysicalId", reason=nil)
    reason ||= "See the details in CloudWatch Log Group: #{context.log_group_name} Log Stream: #{context.log_stream_name}"

    body_data = {
        "Status" => response_status,
        "Reason" => reason,
        "PhysicalResourceId" => physical_id,
        "StackId" => event["StackId"],
        "RequestId" => event["RequestId"],
        "LogicalResourceId" => event["LogicalResourceId"],
        "Data" => response_data
    }

    puts "Response body:\n"
    puts JSON.dump(body_data)

    response_body = JSON.dump(body_data) # response_body is a JSON string

    url = event["ResponseURL"]
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.open_timeout = http.read_timeout = 30
    http.use_ssl = true if uri.scheme == "https"

    # must used url to include the AWSAccessKeyId and Signature
    req = Net::HTTP::Put.new(url) # url includes query string and uri.path does not, must used url t
    req.body = response_body
    req.content_length = response_body.bytesize

    # set headers
    req["content-type"] = ""
    req["content-length"] = response_body.bytesize

    if ENV["CFNRESPONSE_TEST"]
        puts "uri #{uri.inspect}"
        return body_data # early return to not send the request
    end

    res = http.request(req)
    puts "status code: #{res.code}"
    puts "headers: #{res.each_header.to_h.inspect}"
    puts "body: #{res.body}"
end
