import * as fs from 'fs';
import { join } from 'path';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseDependencyPackager, DependencyPackagerProps, LayerProps } from './base';

/**
 * Packager for creating Lambda layers for Ruby dependencies in AWS. Nothing is done locally so this doesn't require Docker, doesn't download any packages and doesn't upload huge files to S3.
 */
export class RubyDependencyPackager extends BaseDependencyPackager {
  private static runtimeVersion(props?: DependencyPackagerProps) {
    return (props?.runtime ?? lambda.Runtime.RUBY_2_7).name.replace('ruby', ''); // TODO ugly
  }

  constructor(scope: Construct, id: string, props?: DependencyPackagerProps) {
    super(scope, id, {
      props,
      runtimeFamily: lambda.RuntimeFamily.RUBY,
      defaultRuntime: lambda.Runtime.RUBY_2_7,
      codeBuildRuntimeInstallCommands: [
        `RUBY_VERSION=\`rbenv install -l | tr -d ' ' | grep ^${RubyDependencyPackager.runtimeVersion(props)} | sort -Vr | head -n 1\``,
        'echo Installing Ruby ${RUBY_VERSION}',
        'rbenv install -s ${RUBY_VERSION}',
        'rbenv global ${RUBY_VERSION}',
      ],
      targetDirectory: 'ruby',
    });
  }

  /**
   * Create a layer for dependencies defined in Gemfile and (optionally) Gemfile.lock and installed with Bundler.
   */
  layerFromBundler(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'Gemfile'), join(outputDir, 'Gemfile'));
        if (fs.existsSync(join(path, 'Gemfile.lock'))) {
          fs.copyFileSync(join(path, 'Gemfile.lock'), join(outputDir, 'Gemfile.lock'));
        }
      },
      this._hashFiles(path, ['Gemfile'], ['Gemfile.lock']),
      [
        'mkdir -p ruby/gems',
        'bundle config set path ruby/gems',
        'bundle install',
        'mv ruby/gems/ruby/* ruby/gems/',
        'rm -rf ruby/gems/*/cache',
        'rm -rf ruby/gems/ruby',
      ],
      props,
    );
  }
}