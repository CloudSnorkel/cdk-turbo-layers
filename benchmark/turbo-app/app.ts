import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_logs as logs } from 'aws-cdk-lib';
import { PythonDependencyPackager } from '../../lib';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'Turbo-Layers-Benchmark', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
new lambda.Function(stack, 'Function', {
  runtime: lambda.Runtime.PYTHON_3_9,
  code: lambda.Code.fromAsset('../function1'),
  handler: 'index.handler',
  logRetention: logs.RetentionDays.ONE_DAY,
  layers: [
    new PythonDependencyPackager(stack, 'Packager', {
      runtime: lambda.Runtime.PYTHON_3_9,
    }).layerFromRequirementsTxt('Layer', '../function1'),
  ],
});
