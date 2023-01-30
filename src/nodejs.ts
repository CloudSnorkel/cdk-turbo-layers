import * as fs from 'fs';
import { join } from 'path';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseDependencyPackager, DependencyPackagerProps, LayerProps } from './base';

/**
 * Packager for creating Lambda layers for Node.js dependencies in AWS. Nothing is done locally so this doesn't require Docker, doesn't download any packages and doesn't upload huge files to S3.
 */
export class NodejsDependencyPackager extends BaseDependencyPackager {
  private static runtimeVersion(props?: DependencyPackagerProps) {
    return (props?.runtime ?? lambda.Runtime.NODEJS_16_X).name.replace('nodejs', '').replace('.x', ''); // TODO ugly
  }

  constructor(scope: Construct, id: string, props?: DependencyPackagerProps) {
    super(scope, id, {
      props,
      runtimeFamily: lambda.RuntimeFamily.NODEJS,
      defaultRuntime: lambda.Runtime.NODEJS_16_X,
      codeBuildRuntimeInstallCommands: [
        `echo Installing Node.js ${NodejsDependencyPackager.runtimeVersion(props)}`,
        `n ${NodejsDependencyPackager.runtimeVersion(props)}`,
      ],
      targetDirectory: 'nodejs',
    });
  }

  /**
   * Create a layer for dependencies passed as an argument and installed with npm.
   */
  layerFromInline(id: string, libraries: string[], props?: LayerProps) {
    return this._newLayer(
      id, '.', // uniqueTempDir,
      outputDir => {
        const packageJson = librariesToPackageJson(libraries);
        fs.writeFileSync(join(outputDir, 'package.json'), JSON.stringify(packageJson));
      },
      libraries.join(','), // CDK will hash it for us
      [
        'npm i',
        'mkdir nodejs',
        'mv node_modules nodejs/',
      ],
      props,
    );
  }

  /**
   * Create a layer for dependencies defined in package.json and (optionally) package-lock.json and installed with npm.
   */
  layerFromPackageJson(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'package.json'), join(outputDir, 'package.json'));
        if (fs.existsSync(join(path, 'package-lock.json'))) {
          fs.copyFileSync(join(path, 'package-lock.json'), join(outputDir, 'package-lock.json'));
        }
      },
      this._hashFiles(path, ['package.json'], ['package-lock.json']),
      [
        'npm ci',
        'mkdir nodejs',
        'mv node_modules nodejs/',
      ],
      props,
    );
  }

  /**
   * Create a layer for dependencies defined in package.json and yarn.lock and installed with yarn.
   */
  layerFromYarn(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'package.json'), join(outputDir, 'package.json'));
        fs.copyFileSync(join(path, 'yarn.lock'), join(outputDir, 'yarn.lock'));
      },
      this._hashFiles(path, ['package.json'], ['yarn.lock']),
      [
        'which yarn || npm install --global yarn',
        'yarn install --check-files --frozen-lockfile',
        'mkdir nodejs',
        'mv node_modules nodejs/',
      ],
      props,
    );
  }
}

/**
 * @internal
 */
export function librariesToPackageJson(libraries: string[]): any {
  let packageJson = {
    dependencies: <{ [id: string]: string }>{},
  };
  for (const library of libraries) {
    let prefix = '';
    let libraryWithoutPrefix = library;
    if (library.length && library[0] == '@') {
      prefix = '@';
      libraryWithoutPrefix = library.substring(1);
    }
    const [name, version] = libraryWithoutPrefix.split('@', 2);
    packageJson.dependencies[prefix + name] = version ?? '*';
  }
  return packageJson;
}