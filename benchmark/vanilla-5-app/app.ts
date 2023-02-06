/* eslint-disable-next-line import/no-extraneous-dependencies */
import * as lambda_python from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_logs as logs } from 'aws-cdk-lib';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'Turbo-Layers-Benchmark-Vanilla', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
for (let i = 1; i <= 5; i++) {
  new lambda_python.PythonFunction(stack, `Function${i}`, {
    runtime: lambda.Runtime.PYTHON_3_9,
    entry: `../function${i}`,
    logRetention: logs.RetentionDays.ONE_DAY,
  });
}
