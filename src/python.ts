import * as fs from 'fs';
import { join } from 'path';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseDependencyPackager, DependencyPackagerProps, LayerProps } from './base';

/**
 * Packager for creating Lambda layers for Python dependencies in AWS. Nothing is done locally so this doesn't require Docker, doesn't download any packages and doesn't upload huge files to S3.
 */
export class PythonDependencyPackager extends BaseDependencyPackager {
  private static runtimeVersion(props?: DependencyPackagerProps) {
    return (props?.runtime ?? lambda.Runtime.PYTHON_3_9).name.replace('python', ''); // TODO ugly
  }

  constructor(scope: Construct, id: string, props?: DependencyPackagerProps) {
    super(scope, id, {
      props,
      runtimeFamily: lambda.RuntimeFamily.PYTHON,
      defaultRuntime: lambda.Runtime.PYTHON_3_9,
      codeBuildRuntimeInstallCommands: [
        // TODO fails? doesn't actually update -- 3.9.14 instead of 3.9.16
        // 'pyenv update || echo pyenv returned 1',
        `PYTHON_VERSION=\`pyenv install -l | tr -d ' ' | grep ^${PythonDependencyPackager.runtimeVersion(props)} | sort -Vr | head -n 1\``,
        'echo Installing Python ${PYTHON_VERSION}',
        'pyenv install -s ${PYTHON_VERSION}',
        'pyenv global ${PYTHON_VERSION}',
      ],
      targetDirectory: 'python',
    });
  }

  /**
   * Create a layer for dependencies passed as an argument and installed with pip.
   */
  layerFromInline(id: string, requirements: string[], props?: LayerProps) {
    return this._newLayer(
      id, '.',
      outputDir => {
        fs.writeFileSync(join(outputDir, 'requirements.txt'), requirements.join('\n'));
      },
      [
        'python -m venv .venv',
        '.venv/bin/python -m pip --no-input --disable-pip-version-check install -t python --progress-bar off -r requirements.txt',
      ],
      props,
    );
  }

  /**
   * Create a layer for dependencies defined in requirements.txt and installed with pip.
   */
  layerFromRequirementsTxt(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'requirements.txt'), join(outputDir, 'requirements.txt'));
      },
      [
        'python -m venv .venv',
        '.venv/bin/python -m pip --no-input --disable-pip-version-check install -t python --progress-bar off -r requirements.txt',
      ],
      props,
    );
  }

  /**
   * Create a layer for dependencies defined in Pipfile and (optionally) Pipfile.lock and installed with pipenv.
   */
  layerFromPipenv(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'Pipfile'), join(outputDir, 'Pipfile'));
        if (fs.existsSync(join(path, 'Pipfile.lock'))) {
          fs.copyFileSync(join(path, 'Pipfile.lock'), join(outputDir, 'Pipfile.lock'));
        }
      },
      [
        'pip install --no-input pipenv',
        'PIPENV_VENV_IN_PROJECT=1 pipenv sync',
        'mv .venv python',
      ],
      props,
    );
  }

  /**
   * Create a layer for dependencies defined in pyproject.toml and (optionally) poetry.lock and installed with poetry.
   */
  layerFromPoetry(id: string, path: string, props?: LayerProps) {
    return this._newLayer(
      id, path,
      outputDir => {
        fs.copyFileSync(join(path, 'pyproject.toml'), join(outputDir, 'pyproject.toml'));
        if (fs.existsSync(join(path, 'poetry.lock'))) {
          fs.copyFileSync(join(path, 'poetry.lock'), join(outputDir, 'poetry.lock'));
        }
      },
      [
        //'curl -sSL https://install.python-poetry.org | python -',
        'pip install --no-input poetry',
        'poetry config virtualenvs.in-project true',
        'poetry install --sync',
        'mv .venv python',
      ],
      props,
    );
  }
}