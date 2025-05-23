const { awscdk } = require('projen');
const { Stability } = require('projen/lib/cdk/jsii-project');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Amir Szekely',
  authorAddress: 'amir@cloudsnorkel.com',
  stability: Stability.EXPERIMENTAL,
  cdkVersion: '2.123.0', // 2.54.0 for https://github.com/aws/aws-cdk/pull/22124, 2.77.0 for removing node 14, 2.87.0 for node 18 on CodeBuild, 2.123.0 for lambda logs
  defaultReleaseBranch: 'main',
  name: '@cloudsnorkel/cdk-turbo-layers',
  repositoryUrl: 'https://github.com/CloudSnorkel/cdk-turbo-layers.git',
  license: 'Apache-2.0',
  description: 'Speed-up Lambda function deployment with dependency layers built in AWS',
  devDeps: [
    'esbuild', // for faster NodejsFunction bundling
    '@aws-sdk/client-codebuild',
    '@aws-sdk/client-s3',
    '@types/aws-lambda',
    'adm-zip',
    '@types/adm-zip',
    'xterm-benchmark',
    'execa',
    '@aws-cdk/aws-lambda-python-alpha',
  ],
  deps: [
  ],
  releaseToNpm: true,
  publishToPypi: {
    distName: 'cloudsnorkel.cdk-turbo-layers',
    module: 'cloudsnorkel.cdk_turbo_layers',
  },
  publishToGo: {
    moduleName: 'github.com/CloudSnorkel/cdk-turbo-layers-go',
  },
  publishToMaven: {
    mavenGroupId: 'com.cloudsnorkel',
    mavenArtifactId: 'cdk.turbo-layers',
    javaPackage: 'com.cloudsnorkel.cdk.turbo_layers',
    mavenEndpoint: 'https://s01.oss.sonatype.org',
  },
  publishToNuget: {
    dotNetNamespace: 'CloudSnorkel',
    packageId: 'CloudSnorkel.Cdk.TurboLayers',
  },
  keywords: [
    'aws',
    'aws-cdk',
    'aws-cdk-construct',
    'cdk',
    'codebuild',
    'lambda',
    'layer',
    'python',
    'nodejs',
    'ruby',
  ],
  gitignore: [
    'cdk.out',
    'cdk.context.json',
    '/.idea',
    'status.json',
  ],
  sampleCode: false,
  compat: true,
  autoApproveOptions: {
    allowedUsernames: ['kichik', 'CloudSnorkelBot'],
  },
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve'],
      schedule: {
        cron: ['0 0 * * 1'],
      },
    },
  },
  githubOptions: {
    pullRequestLintOptions: {
      semanticTitleOptions: {
        types: [
          'feat',
          'fix',
          'chore',
        ],
      },
    },
  },
  pullRequestTemplate: false,
  workflowBootstrapSteps: [
    {
      name: 'Setup Ruby',
      run: 'sudo apt-get update ; sudo apt-get install -y ruby',
    },
  ],
  scripts: {
    benchmark: 'esbuild benchmark/deployment.ts --bundle --target=node14 --platform=node --outfile=benchmark/deployment.js --format=cjs --external:xterm-benchmark && xterm-benchmark benchmark/deployment.js',
  },
  eslintOptions: {
    dirs: ['benchmark'],
  },
  tsconfig: {
    include: ['benchmark/**/*.ts'],
  },
  jsiiVersion: '5.5.x',
  typescriptVersion: '5.5.x',
});

// disable automatic releases, but keep workflow that can be triggered manually
const releaseWorkflow = project.github.tryFindWorkflow('release');
releaseWorkflow.file.addDeletionOverride('on.push');

// set proper line endings
project.gitattributes.addAttributes('*.js', 'eol=lf');
project.gitattributes.addAttributes('*.json', 'eol=lf');
project.gitattributes.addAttributes('*.sh', 'eol=lf');
project.gitattributes.addAttributes('*.yml', 'eol=lf');
project.gitattributes.addAttributes('Dockerfile', 'eol=lf');

// we can't count on @aws-sdk to be there because the user might use nodejs 16 or 18
const bundleNodejsStep = project.tasks.tryFind('bundle:package-nodejs.lambda').steps[0];
bundleNodejsStep.exec = bundleNodejsStep.exec.replace('--external:@aws-sdk/*', '');

// extra lambdas
project.bundler.bundleTask.exec('rm -rf assets/package-ruby.lambda');
project.bundler.bundleTask.exec('mkdir -p assets/package-python.lambda assets/package-ruby.lambda');
project.bundler.bundleTask.exec('cp src/package-python.lambda.py assets/package-python.lambda/index.py');
project.bundler.bundleTask.exec('cp src/package-ruby.lambda.rb assets/package-ruby.lambda/index.rb');
project.bundler.bundleTask.exec('gem install --no-document --version 2.3.2 --install-dir assets/package-ruby.lambda/vendor rubyzip');
project.bundler.bundleTask.exec('mv assets/package-ruby.lambda/vendor/gems/rubyzip-2.3.2/lib assets/package-ruby.lambda/rubyzip');
project.bundler.bundleTask.exec('rm -rf assets/package-ruby.lambda/vendor');

// funding
project.package.addField('funding', 'https://github.com/sponsors/CloudSnorkel');

project.synth();
