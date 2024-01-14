import json
import os
import subprocess
import tempfile
import time
import threading
import traceback
import zipfile

import boto3
import urllib3

SUCCESS = "SUCCESS"
FAILED = "FAILED"

http = urllib3.PoolManager()
s3 = boto3.client("s3")


class CommandError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


def cancel_on_timeout(event, context):
    time.sleep((context.get_remaining_time_in_millis() / 1000) - 5)
    send(event, context, FAILED, {}, "ERROR", reason="Lambda timed out. Try using CodeBuild packager instead.")


def handler(event, context):
    try:
        # read properties
        request_type = event["RequestType"]
        properties = event["ResourceProperties"]
        preinstall_commands = properties["PreinstallCommands"]
        commands = properties["Commands"]
        packaged_directory = properties["PackagedDirectory"]
        asset_bucket = properties["AssetBucket"]
        asset_key = properties["AssetKey"]
        target_bucket = properties["BucketName"]

        print(request_type)
        print(properties)

        # setup home
        os.makedirs("/tmp/home", exist_ok=True)
        os.environ["HOME"] = "/tmp/home"
        os.environ["PATH"] += ":/tmp/home/.local/bin"

        # cancel custom resource on timeout because lambda runs up to 15 minutes, but custom resource waits for an hour
        threading.Thread(target=cancel_on_timeout, args=[event, context], daemon=True).start()

        # handle request
        if request_type in ["Create", "Update"]:
            try:
                key = install(event, context, asset_bucket, asset_key, preinstall_commands + commands, packaged_directory, target_bucket)
                send(event, context, SUCCESS, {}, key)
            except CommandError as e:
                send(event, context, FAILED, {}, "ERROR", reason=e.message)

        elif request_type == "Delete":
            key = event["PhysicalResourceId"]
            try:
                s3.delete_object(Bucket=target_bucket, Key=key)
            except Exception as e:
                print(f"Unable to delete package: {e}")
            send(event, context, SUCCESS, {}, key)

        else:
            send(event, context, FAILED, {}, "ERROR", reason="Bad request type")

    except Exception as e:
        send(event, context, FAILED, {}, "ERROR", reason=f"Internal error: {e}")
        traceback.print_exc()

def install(event, context, asset_bucket, asset_key, commands, packaged_directory, target_bucket):
    with tempfile.TemporaryDirectory() as temp:
        # extract asset with requirements file
        print("Downloading and unpacking asset...")

        asset_path = os.path.join(temp, "asset.zip")
        s3.download_file(asset_bucket, asset_key, asset_path)
        zipfile.ZipFile(asset_path).extractall(temp)

        # run installation commands
        print("Running installation commands...")

        for command in commands:
            try:
                print(command)
                print(subprocess.check_output(command, cwd=temp, stderr=subprocess.STDOUT, shell=True, universal_newlines=True))
            except subprocess.CalledProcessError as e:
                print(e.output)
                output = e.output
                if len(output) > 500:
                   # custom resource response size is limited
                   output = "..." + output[-500:]

                raise CommandError(f"COMMAND FAILED {command}\n{output}")

        # zip it up
        print("Packaging dependencies...")

        package_path = os.path.join(temp, "package.zip")
        with zipfile.ZipFile(package_path, "w") as z:
            for root, folders, files in os.walk(os.path.join(temp, packaged_directory)):
                for f in files:
                    local_path = os.path.join(root, f)
                    zip_path = os.path.relpath(local_path, temp)
                    # we can use ZipInfo because it sets a consistent file date which lead to unchanged zips (for unchanged requirements)
                    # but all package managers create .pyc files that are inconsistent because they have embedded dates
                    # z.writestr(zipfile.ZipInfo(zip_path), open(local_path, 'rb').read(), zipfile.ZIP_DEFLATED)
                    z.write(local_path, zip_path, zipfile.ZIP_DEFLATED)

        # hash the zip
        print("Hashing package...")

        package_hash = subprocess.check_output(["sha256sum", package_path], universal_newlines=True).split()[0]
        # try:
        #     s3.head_object(Bucket=target_bucket, Key=f"{zip_hash}.zip")
        # except:
        #     # TODO if exists, don't upload
        #     pass

        # upload
        print("Uploading package...")
        s3.upload_file(package_path, target_bucket, f"{package_hash}.zip")

        return f"{package_hash}.zip"


def send(event, context, responseStatus, responseData, physicalResourceId=None, noEcho=False, reason=None):
    responseUrl = event["ResponseURL"]

    responseBody = {
        "Status": responseStatus,
        "Reason": reason or "See the details in CloudWatch Log Stream: {}".format(context.log_stream_name),
        "PhysicalResourceId": physicalResourceId or context.log_stream_name,
        "StackId": event["StackId"],
        "RequestId": event["RequestId"],
        "LogicalResourceId": event["LogicalResourceId"],
        "NoEcho": noEcho,
        "Data": responseData
    }

    json_responseBody = json.dumps(responseBody)

    print("Response body:")
    print(json_responseBody)

    headers = {
        "content-type": "",
        "content-length": str(len(json_responseBody))
    }

    try:
        response = http.request("PUT", responseUrl, headers=headers, body=json_responseBody)
        print("Status code:", response.status)

    except Exception as e:

        print("send(..) failed executing http.request(..):", e)
