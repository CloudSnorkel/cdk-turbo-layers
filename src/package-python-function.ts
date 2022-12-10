import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for PackagePythonFunction
 */
export interface PackagePythonFunctionProps extends lambda.FunctionOptions {
}

/**
 * An AWS Lambda function which executes src/package-python.
 */
export class PackagePythonFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: PackagePythonFunctionProps) {
    super(scope, id, {
      description: 'src/package-python.lambda.py',
      runtime: lambda.Runtime.PYTHON_3_9,
      ...props,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/package-python.lambda')),
    });
  }
}