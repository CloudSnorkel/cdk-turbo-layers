import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { PythonDependencyPackager } from '../src';

test('Packager runtime version matches', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'test');

  new PythonDependencyPackager(stack, 'packager 3.7', {
    runtime: lambda.Runtime.PYTHON_3_7,
  });
  new PythonDependencyPackager(stack, 'packager 3.8', {
    runtime: lambda.Runtime.PYTHON_3_8,
  });
  new PythonDependencyPackager(stack, 'packager 3.9', {
    runtime: lambda.Runtime.PYTHON_3_9,
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties(
    'AWS::Lambda::Function',
    Match.objectLike({
      Runtime: lambda.Runtime.PYTHON_3_7.name,
    }),
  );
  template.hasResourceProperties(
    'AWS::Lambda::Function',
    Match.objectLike({
      Runtime: lambda.Runtime.PYTHON_3_8.name,
    }),
  );
  template.hasResourceProperties(
    'AWS::Lambda::Function',
    Match.objectLike({
      Runtime: lambda.Runtime.PYTHON_3_9.name,
    }),
  );
});
