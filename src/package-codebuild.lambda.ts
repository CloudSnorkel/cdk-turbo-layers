/* eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved */
import * as AWSLambda from 'aws-lambda';
/* eslint-disable-next-line import/no-extraneous-dependencies */
import * as AWS from 'aws-sdk';
import { customResourceRespond } from './cr';

const codebuild = new AWS.CodeBuild();
const s3 = new AWS.S3();


/* eslint-disable @typescript-eslint/no-require-imports, import/no-extraneous-dependencies */
export async function handler(event: AWSLambda.CloudFormationCustomResourceEvent, context: AWSLambda.Context) {
  try {
    console.log(JSON.stringify({ ...event, ResponseURL: '...' }));

    const projectName = event.ResourceProperties.ProjectName;
    const installRuntimeCommands = event.ResourceProperties.CodeBuildInstallCommands;
    const preinstallCommands = event.ResourceProperties.PreinstallCommands;
    const commands = event.ResourceProperties.Commands;
    const packagedDirectory = event.ResourceProperties.PackagedDirectory;
    const assetBucket = event.ResourceProperties.AssetBucket;
    const assetKey = event.ResourceProperties.AssetKey;
    const targetBucket = event.ResourceProperties.BucketName;

    const failCheckCommands = [`if [ $CODEBUILD_BUILD_SUCCEEDING -ne 1 ]; then
cat <<EOF > /tmp/payload.json
{
  "StackId": "$STACK_ID",
  "RequestId": "$REQUEST_ID",
  "LogicalResourceId": "$LOGICAL_RESOURCE_ID",
  "PhysicalResourceId": "fail",
  "Status": "FAILED",
  "Reason": \`tail -c 400 /tmp/codebuild.log | jq -Rsa .\`,
  "Data": {}
}
EOF
  if [ "$RESPONSE_URL" != "unspecified" ]; then
    jq . /tmp/payload.json; curl -fsSL -X PUT -H "Content-Type:" -d "@/tmp/payload.json" "$RESPONSE_URL"
  fi
fi`];

    switch (event.RequestType) {
      case 'Create':
      case 'Update':
        console.log(`Starting CodeBuild project ${projectName}`);
        await codebuild.startBuild({
          projectName,
          sourceTypeOverride: 'S3',
          sourceLocationOverride: `${assetBucket}/${assetKey}`,
          buildspecOverride: JSON.stringify({
            version: '0.2',
            env: {
              variables: {
                STACK_ID: event.StackId,
                REQUEST_ID: event.RequestId,
                LOGICAL_RESOURCE_ID: event.LogicalResourceId,
                RESPONSE_URL: event.ResponseURL,
              },
            },
            phases: {
              install: {
                commands: logCommands(installRuntimeCommands),
                finally: failCheckCommands,
              },
              pre_build: {
                commands: logCommands(preinstallCommands),
                finally: failCheckCommands,
              },
              build: {
                commands: logCommands(
                  commands.concat([
                    // `find ${internalProps.targetDirectory} | xargs -L 100 touch -m -t 200001010101.01`, // consistent dates for consistent zips
                    `zip -r package.zip ${packagedDirectory}`,
                    'KEY=`sha256sum package.zip | cut -d " " -f 1`.zip',
                    `aws s3 cp --no-progress package.zip s3://${targetBucket}/\${KEY}`,
                    'echo -n $KEY > KEY',
                  ]),
                ),
              },
              post_build: {
                commands: [
                  'if [ $CODEBUILD_BUILD_SUCCEEDING -eq 1 ]; then\n' +
                  'cat <<EOF > /tmp/payload.json\n' +
                  '{\n' +
                  '  "StackId": "$STACK_ID",\n' +
                  '  "RequestId": "$REQUEST_ID",\n' +
                  '  "LogicalResourceId": "$LOGICAL_RESOURCE_ID",\n' +
                  // the physical resource id is the hash of the result package so changes will create a new layer
                  '  "PhysicalResourceId": "`cat KEY`",\n' +
                  '  "Status": "SUCCESS",\n' +
                  '  "Reason": "",\n' +
                  '  "Data": {}\n' +
                  '}\n' +
                  'EOF\n' +
                  'if [ "$RESPONSE_URL" != "unspecified" ]; then\n' +
                  'jq . /tmp/payload.json; curl -fsSL -X PUT -H "Content-Type:" -d "@/tmp/payload.json" "$RESPONSE_URL"\n' +
                  'fi\n' +
                  'fi',
                ],
                finally: failCheckCommands,
              },
            },
          }, null, 2),
        }).promise();
        break;
      case 'Delete':
        try {
          await s3.deleteObject({
            Bucket: targetBucket,
            Key: event.PhysicalResourceId,
          }).promise();
        } catch (e) {
          console.error(`Ignoring error to delete s3://${targetBucket}/${event.PhysicalResourceId}`);
        }
        await customResourceRespond(event, 'SUCCESS', '', event.PhysicalResourceId, {});
        break;
    }
  } catch (e) {
    console.error(e);
    await customResourceRespond(event, 'FAILED', (e as Error).message || 'Internal Error', context.logStreamName, {});
  }
}

/**
 * Convert commands to a command that logs everything into /tmp/codebuild.log.
 *
 * @return ( set -ex; command-1 ; command 2 ;  ) 2>&1 | tee /tmp/codebuild.log
 */
function logCommands(commands: string[]): string[] {
  return [['( set -ex'].concat(commands).concat([' ) 2>&1 | tee /tmp/codebuild.log']).join(' ; ')];
}
