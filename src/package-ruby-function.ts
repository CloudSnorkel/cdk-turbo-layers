import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for PackageRubyFunction
 */
export interface PackageRubyFunctionProps extends lambda.FunctionOptions {
}

/**
 * An AWS Lambda function which executes src/package-ruby.
 */
export class PackageRubyFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: PackageRubyFunctionProps) {
    super(scope, id, {
      description: 'src/package-ruby.lambda.rb',
      runtime: lambda.Runtime.RUBY_2_7,
      ...props,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/package-ruby.lambda')),
    });
  }
}