import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { librariesToPackageJson, NodejsDependencyPackager } from '../src';

test('Inline version parsing', () => {
  const packageJson = librariesToPackageJson(['@aws-sdk/client-s3@3.259.0', 'nothing', 'library@v595']);
  expect(packageJson).toMatchObject({
    dependencies: {
      '@aws-sdk/client-s3': '3.259.0',
      'nothing': '*',
      'library': 'v595',
    },
  });
});

test('Packager runtime version matches', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');

  new NodejsDependencyPackager(stack, 'packager 14', {
    runtime: lambda.Runtime.NODEJS_14_X,
  });
  new NodejsDependencyPackager(stack, 'packager 16', {
    runtime: lambda.Runtime.NODEJS_16_X,
  });
  new NodejsDependencyPackager(stack, 'packager 18', {
    runtime: lambda.Runtime.NODEJS_18_X,
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties(
    'AWS::Lambda::Function',
    Match.objectLike({
      Runtime: lambda.Runtime.NODEJS_14_X.name,
    }),
  );
  template.hasResourceProperties(
    'AWS::Lambda::Function',
    Match.objectLike({
      Runtime: lambda.Runtime.NODEJS_16_X.name,
    }),
  );
  template.hasResourceProperties(
    'AWS::Lambda::Function',
    Match.objectLike({
      Runtime: lambda.Runtime.NODEJS_18_X.name,
    }),
  );
});

