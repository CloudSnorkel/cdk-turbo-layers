# Turbo Layers for CDK

[![NPM](https://img.shields.io/npm/v/@cloudsnorkel/cdk-turbo-layers?label=npm&logo=npm)][7]
[![PyPI](https://img.shields.io/pypi/v/cloudsnorkel.cdk-turbo-layers?label=pypi&logo=pypi)][6]
[![Maven Central](https://img.shields.io/maven-central/v/com.cloudsnorkel/cdk.turbo-layers.svg?label=Maven%20Central&logo=java)][8]
[![Go](https://img.shields.io/github/v/tag/CloudSnorkel/cdk-turbo-layers?color=red&label=go&logo=go)][11]
[![Nuget](https://img.shields.io/nuget/v/CloudSnorkel.Cdk.TurboLayers?color=red&&logo=nuget)][12]
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/CloudSnorkel/cdk-turbo-layers/blob/main/LICENSE)

Speed up deployment of Lambda functions by creating dependency layers in AWS instead of locally.

* ⛓️ Easily separate dependency deployment from Lambda code deployment
* 🔁 Never re-package dependencies just because of a small code change
* ☁️ Never download another single dependency package locally again
* 🏋️ Never upload oversized code packages again
* 🌎 Edit your code in the browser -- no more "deployment package too large to enable inline code editing"
* ❌ Uninstall Docker from your laptop and extend your battery life
* ☕ Take shorter coffee breaks when deploying

Supported Lambda runtimes:

* 🐍 Python
* 📜 Node.js
* 💎 Ruby
* ☕ Java

## Benchmark

Below are synth and deploy times for a simple Python function with [`PythonFunction`](https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-lambda-python-alpha.PythonFunction.html) compared to Turbo Layers. The [benchmark](benchmark/deployment.ts) ran three times and the best time were taken for each step.

|                        | 💤 PythonFunction   | 🚀 Turbo Layers  | 💤 5x PythonFunction | 🚀 5x Functions w/ Shared Turbo Layer |
|------------------------|---------------------|------------------|----------------------|---------------------------------------|
| Initial Synth          | 1:21                | 0:06             | 2:43                 | 0:06                                  |
| Initial Deploy         | 1:18                | 2:05             | 2:10                 | 2:06                                  |
| Code Change Synth      | 0:31                | 0:06             | 1:21                 | 0:06                                  |
| Code Change Deploy     | 0:49                | 0:29             | 1:19                 | 0:36                                  |
| New Dependency Synth   | 0:33                | 0:06             | 1:30                 | 0:06                                  |
| New Dependency Deploy  | 0:52                | 1:50             | 1:31                 | 1:50                                  |

As you can see, code changes synth much faster and deploy a bit faster too. Dependency changes take longer to deploy, but are assumed to be way less frequent than code changes. The more dependencies your function uses, the better the results will be.

To run the benchmark yourself use:

```
npm run bundle && npm run benchmark
```

## API

The best way to browse API documentation is on [Constructs Hub][13]. It is available in all supported programming languages.

## Installation

1. Confirm you're using CDK v2
2. Install the appropriate package
    1. [Python][6]
       ```
       pip install cloudsnorkel.cdk-turbo-layers
       ```
    2. [TypeScript or JavaScript][7]
       ```
       npm i @cloudsnorkel/cdk-turbo-layers
       ```
    3. [Java][8]
       ```xml
       <dependency>
       <groupId>com.cloudsnorkel</groupId>
       <artifactId>cdk.turbo-layers</artifactId>
       </dependency>
       ```
    4. [Go][11]
       ```
       go get github.com/CloudSnorkel/cdk-turbo-layers-go/cloudsnorkelcdkturbolayers
       ```
    5. [.NET][12]
       ```
       dotnet add package CloudSnorkel.Cdk.TurboLayers
       ```

## Examples

The very basic example below will create a layer with dependencies specified as parameters and attach it to a Lambda function.

```typescript
 const packager = new PythonDependencyPackager(this, 'Packager', {
    runtime: lambda.Runtime.PYTHON_3_9,
    type: DependencyPackagerType.LAMBDA,
});
new Function(this, 'Function with inline requirements', {
    handler: 'index.handler',
    code: lambda.Code.fromInline('def handler(event, context):\n  import requests'),
    runtime: lambda.Runtime.PYTHON_3_9,
    // this will create a layer from with requests and Scrapy in a Lambda function instead of locally
    layers: [packager.layerFromInline('inline requirements', ['requests', 'Scrapy'])],
});
```

The next example will create a layer with dependencies specified in a `requirements.txt` file and attach it to a Lambda function.

```typescript
const packager = new PythonDependencyPackager(this, 'Packager', {
    runtime: lambda.Runtime.PYTHON_3_9,
    type: DependencyPackagerType.LAMBDA,
});
new Function(this, 'Function with external source and requirements', {
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda-src'),
    runtime: lambda.Runtime.PYTHON_3_9,
    // this will read requirements.txt and create a layer from the requirements in a Lambda function instead of locally
    layers: [packager.layerFromRequirementsTxt('requirements.txt', 'lambda-src')],
});
```

Custom package managers like Pipenv or Poetry are also supported.

```typescript
const packager = new PythonDependencyPackager(this, 'Packager', {
    runtime: lambda.Runtime.PYTHON_3_9,
    type: DependencyPackagerType.LAMBDA,
});
new Function(this, 'Function with external source and requirements', {
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda-poetry-src'),
    runtime: lambda.Runtime.PYTHON_3_9,
    // this will read pyproject.toml and poetry.lock and create a layer from the requirements in a Lambda function instead of locally
    layers: [packager.layerFromPoetry('poetry dependencies', 'lambda-poetry-src')],
});
```

If your dependencies have some C library dependencies, you may need to use the more capable but slower CodeBuild packager.

```typescript
const packager = new PythonDependencyPackager(this, 'Packager', {
    runtime: lambda.Runtime.PYTHON_3_9,
    type: DependencyPackagerType.CODEBUILD,
    preinstallCommands: [
        'apt install -y libxml2-dev libxslt-dev libffi-dev libssl-dev',
    ],
});
new Function(this, 'Function with external source and requirements', {
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda-pipenv-src'),
    runtime: lambda.Runtime.PYTHON_3_9,
    layers: [packager.layerFromPipenv('pipenv dependencies', 'lambda-pipenv-src')],
});
```

Building layers for ARM64 functions is also supported.

```typescript
const packager = new PythonDependencyPackager(this, 'Packager', {
    runtime: lambda.Runtime.PYTHON_3_9,
    type: DependencyPackagerType.LAMBDA,
    architecture: Architecture.ARM_64,
});
new Function(this, 'Function with external source and requirements', {
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda-poetry-src'),
    runtime: lambda.Runtime.PYTHON_3_9,
    architecture: Architecture.ARM_64,
    layers: [packager.layerFromPoetry('poetry dependencies', 'lambda-poetry-src')],
});
```

All these examples are for Python, but the same API is available for Node.js, Ruby, and Java. The same build options are available. Multiple different package managers are supported. See [Constructs Hub][13] for more details.

## Older Implementations

* [lovage](https://github.com/CloudSnorkel/lovage): standalone Python framework that uses the same trick to deploy decorated functions to AWS
* [serverless-pydeps](https://github.com/CloudSnorkel/serverless-pydeps): plugin for [Serverless Framework](https://www.serverless.com/) that speeds up deployment

[6]: https://pypi.org/project/cloudsnorkel.cdk-turbo-layers
[7]: https://www.npmjs.com/package/@cloudsnorkel/cdk-turbo-layers
[8]: https://search.maven.org/search?q=g:%22com.cloudsnorkel%22%20AND%20a:%22cdk.turbo-layers%22
[11]: https://pkg.go.dev/github.com/CloudSnorkel/cdk-turbo-layers-go/cloudsnorkelcdkturbolayers
[12]: https://www.nuget.org/packages/CloudSnorkel.Cdk.TurboLayers/
[13]: https://constructs.dev/packages/@cloudsnorkel/cdk-turbo-layers/
