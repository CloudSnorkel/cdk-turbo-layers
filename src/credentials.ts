// import { aws_codeartifact as codeartifact, aws_ecr as ecr } from 'aws-cdk-lib';
//
// /**
//  * Represents credentials used to access Python packages.
//  */
// export abstract class PythonCredential {
//   /**
//    * Creates a DockerCredential for DockerHub.
//    * Convenience method for `customRegistry('https://index.docker.io/v1/', opts)`.
//    */
//   // public static dockerHub(secret: secretsmanager.ISecret, opts: ExternalDockerCredentialOptions = {}): DockerCredential {
//   //   return new ExternalDockerCredential('https://index.docker.io/v1/', secret, opts);
//   // }
//
//   /**
//    * Creates a DockerCredential for a registry, based on its domain name (e.g., 'www.example.com').
//    */
//   // public static customRegistry(
//   //   registryDomain: string,
//   //   secret: secretsmanager.ISecret,
//   //   opts: ExternalDockerCredentialOptions = {}): DockerCredential {
//   //   return new ExternalDockerCredential(registryDomain, secret, opts);
//   // }
//
//   /**
//    * Creates a DockerCredential for one or more ECR repositories.
//    *
//    * NOTE - All ECR repositories in the same account and region share a domain name
//    * (e.g., 0123456789012.dkr.ecr.eu-west-1.amazonaws.com), and can only have one associated
//    * set of credentials (and DockerCredential). Attempting to associate one set of credentials
//    * with one ECR repo and another with another ECR repo in the same account and region will
//    * result in failures when using these credentials in the pipeline.
//    */
//   public static codeArtifact(repositories: ecr.IRepository[], opts?: EcrDockerCredentialOptions): PythonCredential {
//     return new CodeArtifactPythonCredential(repositories, opts ?? {});
//   }
//
//   constructor(protected readonly usages?: DockerCredentialUsage[]) { }
//
//   /**
//    * Determines if this credential is relevant to the input usage.
//    * @internal
//    */
//   public _applicableForUsage(usage: DockerCredentialUsage) {
//     return !this.usages || this.usages.includes(usage);
//   }
//
//   /**
//    * Grant read-only access to the registry credentials.
//    * This grants read access to any secrets, and pull access to any repositories.
//    */
//   public abstract grantRead(grantee: iam.IGrantable, usage: DockerCredentialUsage): void;
//
//   /**
//    * Creates and returns the credential configuration, to be used by `cdk-assets`
//    * to support the `docker-credential-cdk-assets` tool for `docker login`.
//    * @internal
//    */
//   public abstract _renderLoginCommands(): string[]
// }
//
// /** DockerCredential defined by a set of ECR repositories in the same account & region */
// class CodeArtifactPythonCredential extends PythonCredential {
//   public readonly registryDomain: string;
//
//   constructor(private readonly repositories: codeartifact.CfnRepository[], private readonly opts: EcrDockerCredentialOptions) {
//     super(opts.usages);
//
//     if (repositories.length === 0) {
//       throw new Error('must supply at least one `ecr.IRepository` to create an `EcrDockerCredential`');
//     }
//     this.registryDomain = Fn.select(0, Fn.split('/', repositories[0].repositoryUri));
//   }
//
//   public grantRead(grantee: iam.IGrantable, usage: DockerCredentialUsage) {
//     if (!this._applicableForUsage(usage)) { return; }
//
//     if (this.opts.assumeRole) {
//       grantee.grantPrincipal.addToPrincipalPolicy(new iam.PolicyStatement({
//         actions: ['sts:AssumeRole'],
//         resources: [this.opts.assumeRole.roleArn],
//       }));
//     }
//     const role = this.opts.assumeRole ?? grantee;
//     this.repositories.forEach(repo => repo.grantPull(role));
//   }
//
//   public _renderLoginCommands(): string[] {
//     return [
//       'aws codeartifact login --domain test-domain --repository test-repo --tool pip',
//     ];
//   }
// }