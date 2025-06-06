/**
 * Use TriggerFunction to create Lambda functions using our layers. This construct will also run these functions. The functions each try to import a
 * package that's not available in Lambda unless our layer worked. If the stack successfully deploys, that means the layer was successfully created
 * and our functions were able to successfully import the dependencies from our turbo layer.
 */

import * as cdk from 'aws-cdk-lib';
import { Aspects, aws_lambda as lambda, aws_logs as logs, CustomResource, IAspect, triggers } from 'aws-cdk-lib';
import { Construct, IConstruct } from 'constructs';
import { DependencyPackagerType, JavaDependencyPackager, NodejsDependencyPackager, PythonDependencyPackager, RubyDependencyPackager } from '../src';

const app = new cdk.App({
  context: {
    // always run triggers by updating lambda on layer changes -- see https://github.com/aws/aws-cdk/issues/19098
    '@aws-cdk/aws-lambda:recognizeLayerVersion': true,
  },
});

const layerStack = new cdk.Stack(app, 'Turbo-Layer-Test');
const logGroup = new logs.LogGroup(layerStack, 'Logs', {
  retention: logs.RetentionDays.ONE_DAY,
});

class PythonTest extends Construct {
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType, architecture: lambda.Architecture) {
    super(scope, id);

    const packager = new PythonDependencyPackager(this, 'Packager', {
      runtime,
      architecture,
      type,
    });

    const pythonFunctionProps = {
      handler: 'index.handler',
      code: lambda.Code.fromInline('def handler(event, context):\n  import requests'),
      runtime,
      architecture,
      timeout: cdk.Duration.minutes(1), // sometimes Lambda hates me
      logGroup,
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
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType, architecture: lambda.Architecture) {
    super(scope, id);

    const packager = new NodejsDependencyPackager(this, 'Packager', {
      runtime,
      architecture,
      type,
    });

    const nodeFunctionProps = {
      handler: 'index.handler',
      code: lambda.Code.fromInline('module.exports.handler = (event, context, callback) => {require("lodash");callback();}'),
      runtime,
      architecture,
      timeout: cdk.Duration.minutes(1), // sometimes Lambda hates me
      logGroup,
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
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType, architecture: lambda.Architecture) {
    super(scope, id);

    const packager = new RubyDependencyPackager(this, 'Packager', {
      runtime,
      architecture,
      type,
    });

    const rubyFunctionProps = {
      handler: 'index.handler',
      code: lambda.Code.fromAsset('test/assets/ruby_handler'),
      runtime,
      architecture,
      timeout: cdk.Duration.minutes(5), // Ruby takes a while to start
      logGroup,
    };

    new triggers.TriggerFunction(this, 'Bundler Test', {
      ...rubyFunctionProps,
      description: `Test bundler ${runtime} ${type}`,
      layers: [packager.layerFromBundler('bundler', 'test/assets/bundler')],
    });
  }
}

class JavaTest extends Construct {
  constructor(scope: Construct, id: string, runtime: lambda.Runtime, type: DependencyPackagerType, architecture: lambda.Architecture) {
    super(scope, id);

    const packager = new JavaDependencyPackager(this, 'Packager', {
      runtime,
      architecture,
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
      architecture,
      timeout: cdk.Duration.minutes(1),
      memorySize: 512, // really java???
      logGroup,
    };

    new triggers.TriggerFunction(this, 'Maven Test', {
      ...javaFunctionProps,
      description: `Test maven ${runtime} ${type}`,
      layers: [packager.layerFromMaven('maven', 'test/assets/maven')],
    });
  }
}

new PythonTest(layerStack, 'Python 3.9 CodeBuild x64', lambda.Runtime.PYTHON_3_9, DependencyPackagerType.CODEBUILD, lambda.Architecture.X86_64);
new PythonTest(layerStack, 'Python 3.9 Lambda x64', lambda.Runtime.PYTHON_3_9, DependencyPackagerType.LAMBDA, lambda.Architecture.X86_64);
new PythonTest(layerStack, 'Python 3.9 CodeBuild arm64', lambda.Runtime.PYTHON_3_9, DependencyPackagerType.CODEBUILD, lambda.Architecture.ARM_64);
new PythonTest(layerStack, 'Python 3.9 Lambda arm64', lambda.Runtime.PYTHON_3_9, DependencyPackagerType.LAMBDA, lambda.Architecture.ARM_64);
new NodejsTest(layerStack, 'Node.js 16 CodeBuild x64', lambda.Runtime.NODEJS_16_X, DependencyPackagerType.CODEBUILD, lambda.Architecture.X86_64);
new NodejsTest(layerStack, 'Node.js 16 Lambda x64', lambda.Runtime.NODEJS_16_X, DependencyPackagerType.LAMBDA, lambda.Architecture.X86_64);
new NodejsTest(layerStack, 'Node.js 18 CodeBuild x64', lambda.Runtime.NODEJS_18_X, DependencyPackagerType.CODEBUILD, lambda.Architecture.X86_64);
new NodejsTest(layerStack, 'Node.js 18 Lambda x64', lambda.Runtime.NODEJS_18_X, DependencyPackagerType.LAMBDA, lambda.Architecture.X86_64);
new NodejsTest(layerStack, 'Node.js 16 CodeBuild arm64', lambda.Runtime.NODEJS_16_X, DependencyPackagerType.CODEBUILD, lambda.Architecture.ARM_64);
new NodejsTest(layerStack, 'Node.js 16 Lambda arm64', lambda.Runtime.NODEJS_16_X, DependencyPackagerType.LAMBDA, lambda.Architecture.ARM_64);
new NodejsTest(layerStack, 'Node.js 18 CodeBuild arm64', lambda.Runtime.NODEJS_18_X, DependencyPackagerType.CODEBUILD, lambda.Architecture.ARM_64);
new NodejsTest(layerStack, 'Node.js 18 Lambda arm64', lambda.Runtime.NODEJS_18_X, DependencyPackagerType.LAMBDA, lambda.Architecture.ARM_64);
new RubyTest(layerStack, 'Ruby 2.7 CodeBuild x64', lambda.Runtime.RUBY_2_7, DependencyPackagerType.CODEBUILD, lambda.Architecture.X86_64);
new RubyTest(layerStack, 'Ruby 2.7 Lambda x64', lambda.Runtime.RUBY_2_7, DependencyPackagerType.LAMBDA, lambda.Architecture.X86_64);
new RubyTest(layerStack, 'Ruby 2.7 CodeBuild arm64', lambda.Runtime.RUBY_2_7, DependencyPackagerType.CODEBUILD, lambda.Architecture.ARM_64);
new RubyTest(layerStack, 'Ruby 2.7 Lambda arm64', lambda.Runtime.RUBY_2_7, DependencyPackagerType.LAMBDA, lambda.Architecture.ARM_64);
new JavaTest(layerStack, 'Java 11 CodeBuild x64', lambda.Runtime.JAVA_11, DependencyPackagerType.CODEBUILD, lambda.Architecture.X86_64);
new JavaTest(layerStack, 'Java 11 CodeBuild arm64', lambda.Runtime.JAVA_11, DependencyPackagerType.CODEBUILD, lambda.Architecture.ARM_64);

// don't run too many tests at once or CodeBuild will fail
class CodeBuildThrottle implements IAspect {
  private lastBatch: CustomResource[] = [];
  private batch: CustomResource[] = [];

  public visit(construct: IConstruct) {
    if (construct instanceof CustomResource) {
      if (construct.node.id != 'Layer Packager' || !construct.node.path.includes('CodeBuild')) {
        return;
      }

      this.batch.push(construct);

      if (this.batch.length == 8) {
        this.flush();
      }
    }
  }

  public flush() {
    for (const cr of this.batch) {
      cr.node.addDependency(...this.lastBatch);
    }
    this.lastBatch = this.batch;
    this.batch = [];
  }
}

const throttler = new CodeBuildThrottle();
Aspects.of(layerStack).add(throttler);
throttler.flush();
