import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as AWSLambda from 'aws-lambda';
import { customResourceRespond } from './cr';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const AdmZip = require('adm-zip');

const s3 = new S3Client();


/* eslint-disable @typescript-eslint/no-require-imports, import/no-extraneous-dependencies */
export async function handler(event: AWSLambda.CloudFormationCustomResourceEvent, context: AWSLambda.Context) {
  try {
    console.log(JSON.stringify({
      ...event,
      ResponseURL: '...',
    }));

    const preinstallCommands = event.ResourceProperties.PreinstallCommands;
    const commands = event.ResourceProperties.Commands;
    const packagedDirectory = event.ResourceProperties.PackagedDirectory;
    const assetBucket = event.ResourceProperties.AssetBucket;
    const assetKey = event.ResourceProperties.AssetKey;
    const targetBucket = event.ResourceProperties.BucketName;

    // setup home
    try {
      fs.mkdirSync('/tmp/home');
    } catch (err: any) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    process.env.HOME = '/tmp/home';
    process.env.PATH += ':/tmp/home/.local/bin:/tmp/home/.npm-packages/bin';
    process.env.NPM_PACKAGES = '/tmp/home/.npm-packages/';
    await execAndGetOutput('npm config set prefix /tmp/home/.npm-packages', '/tmp/home');

    setTimeout(() => {
      customResourceRespond(event, 'FAILED', 'Lambda timed out. Try using CodeBuild packager instead.', 'ERROR', {}).catch(console.error);
    }, context.getRemainingTimeInMillis() - 5000);

    switch (event.RequestType) {
      case 'Create':
      case 'Update':
        try {
          const key = await install(assetBucket, assetKey, preinstallCommands.concat(commands), packagedDirectory, targetBucket);
          await customResourceRespond(event, 'SUCCESS', '', key, {});
        } catch (err) {
          console.error(err);
          await customResourceRespond(event, 'FAILED', (err as Error).message || 'Internal Error', 'ERROR', {});
        }
        break;
      case 'Delete':
        try {
          await s3.send(new DeleteObjectCommand({
            Bucket: targetBucket,
            Key: event.PhysicalResourceId,
          }));
        } catch (error) {
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

async function install(assetBucket: string, assetKey: string, commands: string[], packagedDirectory: string, targetBucket: string) {
  const temp = fs.mkdtempSync('/tmp/package-');
  try {
    // extract asset with package.json file
    console.log('Downloading and unpacking asset...');

    const assetObject = await s3.send(new GetObjectCommand({
      Bucket: assetBucket,
      Key: assetKey,
    }));
    if (!assetObject.Body) {
      throw new Error('Unable to read asset');
    }

    new AdmZip(Buffer.from(await assetObject.Body.transformToByteArray())).extractAllTo(temp);

    // run installation commands
    console.log('Running installation commands...');

    for (const command of commands) {
      console.log(command);
      const { exitCode, output } = await execAndGetOutput(command, temp);
      console.log(output);
      if (exitCode != 0) {
        let error = output;
        if (error.length > 500) {
          error = '...' + output.substring(-500);
        }
        throw new Error(`COMMAND FAILED ${command}\n${error}`);
      }
    }

    // zip it up
    console.log('Packaging dependencies...');

    const zipPath = path.join(temp, 'package.zip');
    const zipPackage = new AdmZip();
    zipPackage.addLocalFolder(path.join(temp, packagedDirectory), packagedDirectory);
    zipPackage.writeZip(zipPath);

    // hash the zip
    console.log('Hashing package...');

    let zipHash: string;
    {
      const { exitCode, output } = await execAndGetOutput(`sha256sum "${zipPath}"`, temp);
      if (exitCode != 0) {
        throw new Error(`Unable to hash zip ${zipPath}`);
      }

      zipHash = output.split(' ')[0];
    }

    // upload package
    console.log('Uploading package...');
    await s3.send(new PutObjectCommand({
      Bucket: targetBucket,
      Key: `${zipHash}.zip`,
      Body: fs.createReadStream(zipPath),
    }));

    return `${zipHash}.zip`;
  } finally {
    fs.rmSync(temp, {
      recursive: true,
      force: true,
    });
  }
}

interface CommandOutput {
  exitCode: number;
  output: string;
}

function execAndGetOutput(command: string, cwd: string): Promise<CommandOutput> {
  return new Promise((resolve, reject) => {
    let output: string[] = [];
    const exec = child_process.exec(command, { cwd });
    exec.stdout?.on('data', data => {
      output.push(data.toString());
    });
    exec.stderr?.on('data', data => {
      output.push(data.toString());
    });
    exec.on('close', (code, signal) => {
      if (signal !== null) {
        reject(new Error(`Exited with signal ${signal}`));
      } else if (code !== null) {
        resolve({
          exitCode: code,
          output: output.join(''),
        });
      } else {
        reject(new Error('Unknown process exit issue'));
      }
    });
    exec.on('error', err => {
      reject(err);
    });
  });
}
