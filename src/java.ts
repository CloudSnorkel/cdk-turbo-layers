import * as fs from 'fs';
import { join } from 'path';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseDependencyPackager, DependencyPackagerProps, LayerProps } from './base';

/**
 * Packager for creating Lambda layers for Java dependencies in AWS. Nothing is done locally so this doesn't require Docker and doesn't upload huge files to S3.
 */
export class JavaDependencyPackager extends BaseDependencyPackager {
  private static runtimePackage(props?: DependencyPackagerProps) {
    switch (props?.runtime ?? lambda.Runtime.JAVA_11) {
      case lambda.Runtime.JAVA_8:
      case lambda.Runtime.JAVA_8_CORRETTO:
        return 'java-1.8.0-amazon-corretto';
      case lambda.Runtime.JAVA_11:
        return 'java-11-amazon-corretto';
      default:
        throw new Error(`We do not support ${props?.runtime?.name} yet`);
    }
  }

  constructor(scope: Construct, id: string, props?: DependencyPackagerProps) {
    super(scope, id, {
      props,
      runtimeFamily: lambda.RuntimeFamily.JAVA,
      defaultRuntime: lambda.Runtime.JAVA_11,
      codeBuildRuntimeInstallCommands: [
        `echo Installing ${JavaDependencyPackager.runtimePackage(props)}`,
        `yum install -y ${JavaDependencyPackager.runtimePackage(props)}`,
        `alternatives --set java /usr/lib/jvm/${JavaDependencyPackager.runtimePackage(props)}.*/bin/java`,
        `alternatives --set javac /usr/lib/jvm/${JavaDependencyPackager.runtimePackage(props)}.*/bin/javac`,
      ],
      targetDirectory: 'java',
    });
  }

  /**
   * Create a layer for dependencies defined in pom.xml installed with Maven.
   */
  layerFromMaven(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'pom.xml'), join(outputDir, 'pom.xml'));
      },
      this._hashFiles(path, ['pom.xml']),
      [
        'mvn -ntp -B dependency:copy-dependencies -DoutputDirectory=java/lib',
      ],
      props,
    );
  }
}