/**
 * Use TriggerFunction to create Lambda functions using our layers. This construct will also run these functions. The functions each try to import a
 * package that's not available in Lambda unless our layer worked. If the stack successfully deploys, that means the layer was successfully created
 * and our functions were able to successfully import the dependencies from our turbo layer.
 */

import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_logs as logs, triggers } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DependencyPackagerType, JavaDependencyPackager, NodejsDependencyPackager, PythonDependencyPackager, RubyDependencyPackager } from '../src';

const app = new cdk.App({
  context: {
    // always run triggers by updating lambda on layer changes -- see https://github.com/aws/aws-cdk/issues/19098
    '@aws-cdk/aws-lambda:recognizeLayerVersion': true,
  },
});

const layerStack = new cdk.Stack(app, 'Turbo-Layer-Test');

class PythonTest extends Construct {
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType) {
    super(scope, id);

    const packager = new PythonDependencyPackager(this, 'Packager', {
      runtime,
      type,
    });

    const pythonFunctionProps = {
      handler: 'index.handler',
      code: lambda.Code.fromInline('def handler(event, context):\n  import requests'),
      runtime,
      timeout: cdk.Duration.minutes(1), // sometimes Lambda hates me
      logRetention: logs.RetentionDays.ONE_DAY,
    };

    new triggers.TriggerFunction(this, 'Inline', {
      ...pythonFunctionProps,
      description: `Test inline requirements ${runtime} ${type}`,
      layers: [packager.layerFromInline('inline', ['requests'])],
    });
    new triggers.TriggerFunction(this, 'Requirements.txt', {
      ...pythonFunctionProps,
      description: `Test requirements.txt ${runtime} ${type}`,
      layers: [packager.layerFromRequirementsTxt('req.txt', 'test/assets/requirements')],
    });
    new triggers.TriggerFunction(this, 'Pipenv', {
      ...pythonFunctionProps,
      description: `Test pipenv ${runtime} ${type}`,
      layers: [packager.layerFromPipenv('pipenv', 'test/assets/pipenv')],
    });
    new triggers.TriggerFunction(this, 'Poetry', {
      ...pythonFunctionProps,
      description: `Test poetry ${runtime} ${type}`,
      layers: [packager.layerFromPoetry('poetry', 'test/assets/poetry')],
    });
  }
}

class NodejsTest extends Construct {
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType) {
    super(scope, id);

    const packager = new NodejsDependencyPackager(this, 'Packager', {
      runtime,
      type,
    });

    const nodeFunctionProps = {
      handler: 'index.handler',
      code: lambda.Code.fromInline('module.exports.handler = (event, context, callback) => {require("lodash");callback();}'),
      runtime,
      timeout: cdk.Duration.minutes(1), // sometimes Lambda hates me
      logRetention: logs.RetentionDays.ONE_DAY,
    };

    new triggers.TriggerFunction(this, 'NPM Inline Test', {
      ...nodeFunctionProps,
      description: `Test npm ${runtime} ${type}`,
      layers: [packager.layerFromInline('npm inline', ['lodash@^4'])],
    });
    new triggers.TriggerFunction(this, 'NPM Test', {
      ...nodeFunctionProps,
      description: `Test npm ${runtime} ${type}`,
      layers: [packager.layerFromPackageJson('npm', 'test/assets/npm')],
    });
    new triggers.TriggerFunction(this, 'Yarn Test', {
      ...nodeFunctionProps,
      description: `Test yarn ${runtime} ${type}`,
      layers: [packager.layerFromYarn('yarn', 'test/assets/yarn')],
    });
  }
}

class RubyTest extends Construct {
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType) {
    super(scope, id);

    const packager = new RubyDependencyPackager(this, 'Packager', {
      runtime,
      type,
    });

    const rubyFunctionProps = {
      handler: 'index.handler',
      code: lambda.Code.fromAsset('test/assets/ruby_handler'),
      runtime,
      timeout: cdk.Duration.minutes(5), // Ruby takes a while to start
      logRetention: logs.RetentionDays.ONE_DAY,
    };

    new triggers.TriggerFunction(this, 'Bundler Test', {
      ...rubyFunctionProps,
      description: `Test bundler ${runtime} ${type}`,
      layers: [packager.layerFromBundler('bundler', 'test/assets/bundler')],
    });
  }
}

class JavaTest extends Construct {
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType) {
    super(scope, id);

    const packager = new JavaDependencyPackager(this, 'Packager', {
      runtime,
      type,
    });

    const javaFunctionProps: lambda.FunctionProps = {
      handler: 'helloworld.App',
      // GitHub Actions is not configured to allow Docker-in-Docker, and even if it was, the JAR file hash changes with every build.
      // That's why we just use a static file that was built well once. It was built using the commented out code below.
      /*
      code: lambda.Code.fromAsset('test/assets/maven', {
        bundling: {
          image: runtime.bundlingImage,
          command: [
            '/bin/sh', '-c',
            'mvn package -ntp -B -Dmaven.repo.local=/.m2 && mv target/FunctionOne-1.0.jar /asset-output/ && rm -rf target',
          ],
          volumes: [
            {
              // use host .m2 cache for speedier packaging
              hostPath: path.join(os.homedir(), '.m2'),
              containerPath: '/.m2/',
            },
          ],
          outputType: cdk.BundlingOutput.ARCHIVED,
        },
      }),
      */
      code: lambda.Code.fromAsset('test/assets/maven/FunctionOne.jar'),
      runtime,
      timeout: cdk.Duration.minutes(1),
      memorySize: 512, // really java???
      logRetention: logs.RetentionDays.ONE_DAY,
    };

    new triggers.TriggerFunction(this, 'Maven Test', {
      ...javaFunctionProps,
      description: `Test maven ${runtime} ${type}`,
      layers: [packager.layerFromMaven('maven', 'test/assets/maven')],
    });
  }
}

new PythonTest(layerStack, 'Python 3.9 CodeBuild', lambda.Runtime.PYTHON_3_9, DependencyPackagerType.CODEBUILD);
new PythonTest(layerStack, 'Python 3.9 Lambda', lambda.Runtime.PYTHON_3_9, DependencyPackagerType.LAMBDA);
new NodejsTest(layerStack, 'Node.js 16 CodeBuild', lambda.Runtime.NODEJS_16_X, DependencyPackagerType.CODEBUILD);
new NodejsTest(layerStack, 'Node.js 16 Lambda', lambda.Runtime.NODEJS_16_X, DependencyPackagerType.LAMBDA);
new RubyTest(layerStack, 'Ruby 2.7 CodeBuild', lambda.Runtime.RUBY_2_7, DependencyPackagerType.CODEBUILD);
new RubyTest(layerStack, 'Ruby 2.7 Lambda', lambda.Runtime.RUBY_2_7, DependencyPackagerType.LAMBDA);
new JavaTest(layerStack, 'Java 11 CodeBuild', lambda.Runtime.JAVA_11, DependencyPackagerType.CODEBUILD);
