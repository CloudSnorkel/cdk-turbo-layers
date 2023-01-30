import * as fs from 'fs';
import { join } from 'path';
import {
  AssetHashType,
  aws_codebuild as codebuild,
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_logs as logs,
  aws_s3 as s3,
  aws_s3_assets as s3_assets,
  BundlingOptions,
  CustomResource,
  DockerImage,
  Duration,
  FileSystem,
  RemovalPolicy,
  Size,
  Stack,
} from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { PackageCodebuildFunction } from './package-codebuild-function';
import { PackageNodejsFunction } from './package-nodejs-function';
import { PackagePythonFunction } from './package-python-function';
import { PackageRubyFunction } from './package-ruby-function';

/**
 * Type of dependency packager. This affects timeouts and capabilities of the packager.
 */
export enum DependencyPackagerType {
  /**
   * Use Lambda function to package dependencies. It is much faster than the alternative, but limited to 15 minutes and can't build native extensions.
   */
  LAMBDA,

  /**
   * Use CodeBuild to package dependencies. It is capable of everything your local machine can do, but takes a little longer to startup.
   */
  CODEBUILD,
}

export interface DependencyPackagerProps {
  /**
   * Type of dependency packager. Use Lambda for speed and CodeBuild for complex dependencies that require building native extensions.
   *
   * @default {@link DependencyPackagerType.LAMBDA}
   */
  readonly type?: DependencyPackagerType;

  /**
   * Target Lambda runtime. Packages will be installed for this runtime so make sure it fits your Lambda functions.
   */
  readonly runtime?: lambda.Runtime;

  /**
   * Target Lambda architecture. Packages will be installed for this architecture so make sure it fits your Lambda functions.
   */
  readonly architecture?: lambda.Architecture;

  /**
   * Additional commands to run before installing packages. Use this to authenticate your package repositories like CodeArtifact.
   *
   * @default []
   */
  readonly preinstallCommands?: string[];

  /**
   * VPC used for packager. Use this if your package repositories are only available from within a VPC.
   *
   * @default no VPC
   */
  readonly vpc?: ec2.IVpc;

  /**
   * VPC subnets used for packager.
   *
   * @default default subnets, if VPC is used
   */
  readonly subnetSelection?: ec2.SubnetSelection;

  /**
   * The number of days log events are kept in CloudWatch Logs. When updating
   * this property, unsetting it doesn't remove the log retention policy. To
   * remove the retention policy, set the value to `INFINITE`.
   *
   * @default logs.RetentionDays.ONE_MONTH
   */
  readonly logRetention?: logs.RetentionDays;

  /**
  * Removal policy for logs of image builds. If deployment fails on the custom resource, try setting this to `RemovalPolicy.RETAIN`. This way the CodeBuild logs can still be viewed, and you can see why the build failed.
  *
  * We try to not leave anything behind when removed. But sometimes a log staying behind is useful.
  *
  * @default RemovalPolicy.DESTROY
  */
  readonly logRemovalPolicy?: RemovalPolicy;
}

export interface LayerProps {
  /**
   * Always rebuild the layer, even when the dependencies definition files haven't changed.
   *
   * @default false
   */
  readonly alwaysRebuild?: boolean;
}

/**
 * @internal
 */
interface InternalBaseDependencyPackagerProps {
  readonly props?: DependencyPackagerProps;
  readonly runtimeFamily: lambda.RuntimeFamily;
  readonly defaultRuntime: lambda.Runtime;
  readonly codeBuildRuntimeInstallCommands: string[];
  readonly targetDirectory: string;
}

/**
 * @internal
 */
export class BaseDependencyPackager extends Construct implements iam.IGrantable, ec2.IConnectable {
  readonly connections: ec2.Connections;
  readonly grantPrincipal: iam.IPrincipal;
  private readonly project?: codebuild.Project;
  private readonly packagesBucket: s3.Bucket;
  private readonly provider: lambda.Function;
  private readonly targetDirectory: string;
  private readonly type: DependencyPackagerType;
  private readonly architecture: lambda.Architecture;

  constructor(scope: Construct, id: string, readonly internalProps: InternalBaseDependencyPackagerProps) {
    super(scope, id);

    const runtime = internalProps.props?.runtime ?? internalProps.defaultRuntime;
    if (runtime.family != internalProps.runtimeFamily) {
      throw new Error(`PythonDependencyPackager requires python runtime, got ${runtime.family}`);
    }

    this.packagesBucket = new s3.Bucket(this, 'Bucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.targetDirectory = internalProps.targetDirectory;
    this.architecture = internalProps.props?.architecture ?? lambda.Architecture.X86_64;

    this.type = this.internalProps.props?.type ?? DependencyPackagerType.LAMBDA;
    if (this.type == DependencyPackagerType.CODEBUILD) {
      const logGroup = new logs.LogGroup(
        this,
        'Logs',
        {
          retention: internalProps.props?.logRetention ?? RetentionDays.ONE_MONTH,
          removalPolicy: internalProps.props?.logRemovalPolicy ?? RemovalPolicy.DESTROY,
        },
      );

      this.project = new codebuild.Project(this, 'Packager', {
        description: `Lambda dependency packager for ${runtime} in ${Stack.of(this).stackName}`,
        vpc: internalProps.props?.vpc,
        subnetSelection: internalProps.props?.subnetSelection,
        environment: {
          buildImage: this.architecture == lambda.Architecture.X86_64 ?
            codebuild.LinuxBuildImage.AMAZON_LINUX_2_4 : codebuild.LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_2_0,
        },
        logging: {
          cloudWatch: {
            logGroup,
          },
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            build: {
              commands: [
                'echo The real build spec will be put together by the custom resource',
                'exit 1',
              ],
            },
          },
        }),
      });

      this.connections = internalProps.props?.vpc ? this.project.connections : new ec2.Connections();
      this.grantPrincipal = this.project.grantPrincipal;

      this.provider = new PackageCodebuildFunction(this, 'Package Handler', {
        description: `Turbo layer packager for ${runtime} using CodeBuild`,
        initialPolicy: [
          new iam.PolicyStatement({
            actions: ['codebuild:StartBuild'],
            resources: [this.project.projectArn],
          }),
        ],
        logRetention: RetentionDays.ONE_MONTH,
      });
      this.provider.node.addDependency(this.project);
      this.packagesBucket.grantDelete(this.provider);
    } else if (this.type == DependencyPackagerType.LAMBDA) {
      const lambdaProps = {
        description: `Turbo layer packager for ${runtime}`,
        timeout: Duration.minutes(15),
        memorySize: 1024,
        ephemeralStorageSize: Size.gibibytes(10),
        logRetention: RetentionDays.ONE_MONTH,
        architecture: this.architecture,
        vpc: internalProps.props?.vpc,
        vpcSubnets: internalProps.props?.subnetSelection,
        // TODO for CodeArtifact login -- layers: [new lambda_layer_awscli.AwsCliLayer(this, 'AWS CLI Layer')],
      };

      if (runtime.family == lambda.RuntimeFamily.PYTHON) {
        this.provider = new PackagePythonFunction(this, 'Packager', lambdaProps);
      } else if (runtime.family == lambda.RuntimeFamily.NODEJS) {
        this.provider = new PackageNodejsFunction(this, 'Packager', lambdaProps);
      } else if (runtime.family == lambda.RuntimeFamily.RUBY) {
        this.provider = new PackageRubyFunction(this, 'Packager', lambdaProps);
      } else {
        throw new Error(`Runtime doesn't support Lambda packager: ${runtime}`);
      }
      this.connections = internalProps.props?.vpc ? this.provider.connections : new ec2.Connections();
      this.grantPrincipal = this.provider.grantPrincipal;
    } else {
      throw new Error(`Unsupported type: ${this.type}`);
    }

    this.packagesBucket.grantWrite(this.grantPrincipal);
    this.packagesBucket.grantDelete(this.grantPrincipal);
  }

  /**
   * @internal
   */
  protected _newLayer(id: string, path: string, assetGenerator: (outputDir: string) => void,
    assetHash: string, commands: string[], layerProps?: LayerProps) {

    return new LambdaDependencyLayer(this, id, {
      path,
      bundling: {
        local: {
          tryBundle(outputDir: string, _: BundlingOptions): boolean {
            assetGenerator(outputDir);
            return true;
          },
        },
        // no fallback
        image: DockerImage.fromRegistry('public.ecr.aws/docker/library/busybox:stable'),
        command: ['exit 1'],
      },
      assetHash: assetHash,
      alwaysRebuild: layerProps?.alwaysRebuild ?? false,
      project: this.project,
      provider: this.provider,
      packagesBucket: this.packagesBucket,
      preinstallCommands: this.internalProps.props?.preinstallCommands ?? [],
      codeBuildRuntimeInstallCommands: this.internalProps.codeBuildRuntimeInstallCommands,
      commands: commands,
      targetDirectory: this.targetDirectory,
    }).layer;
  }

  /**
   * @internal
   */
  protected _hashFiles(basePath: string, required: string[], optional?: string[]): string {
    let hash = '';
    for (const f of required) {
      hash += FileSystem.fingerprint(join(basePath, f));
    }
    for (const f of optional ?? []) {
      const p = join(basePath, f);
      if (fs.existsSync(p)) {
        hash += FileSystem.fingerprint(p);
      }
    }
    return hash;
  }
}

/**
 * @internal
 */
interface LambdaDependencyLayerProps {
  readonly path: string;
  readonly assetHash: string;
  readonly bundling: BundlingOptions;
  readonly alwaysRebuild: boolean;
  readonly project?: codebuild.Project;
  readonly provider: lambda.Function;
  readonly packagesBucket: s3.Bucket;
  readonly codeBuildRuntimeInstallCommands: string[];
  readonly preinstallCommands: string[];
  readonly commands: string[];
  readonly targetDirectory: string;
}

class LambdaDependencyLayer extends Construct {
  readonly layer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, readonly props: LambdaDependencyLayerProps) {
    super(scope, id);

    // We hash the output files instead of the whole directory because:
    //
    // 1. It's faster than hashing the entire source directory
    // 2. It allows the inline versions to use '.' as a fake source directory without conflict
    // 3. It allows multiple source folders to share the same asset if the dependencies are the same
    const asset = new s3_assets.Asset(this, 'Dependencies Definition', {
      path: props.path,
      assetHashType: AssetHashType.CUSTOM,
      bundling: props.bundling,
      assetHash: props.assetHash,
    });

    const cr = new CustomResource(this, 'Layer Packager', {
      resourceType: 'Custom::LayerPackager',
      serviceToken: props.provider.functionArn,
      properties: {
        ProjectName: props.project?.projectName,
        BucketName: props.packagesBucket.bucketName,
        AlwaysRebuild: props.alwaysRebuild ? Date.now() : undefined,
        CodeBuildInstallCommands: props.codeBuildRuntimeInstallCommands,
        PreinstallCommands: props.preinstallCommands,
        Commands: props.commands,
        PackagedDirectory: props.targetDirectory,
        AssetBucket: asset.s3BucketName,
        AssetKey: asset.s3ObjectKey,
      },
    });

    cr.node.addDependency(props.provider);
    if (props.project) {
      cr.node.addDependency(props.project);
      asset.grantRead(props.project);
    } else {
      asset.grantRead(props.provider);
    }

    this.layer = new lambda.LayerVersion(this, 'Layer', {
      description: `Automatically generated by turbo layers for ${asset}`,
      code: lambda.Code.fromBucket(props.packagesBucket, cr.ref),
    });
  }
}