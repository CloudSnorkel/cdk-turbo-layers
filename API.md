# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### JavaDependencyPackager <a name="JavaDependencyPackager" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager"></a>

- *Implements:* aws-cdk-lib.aws_iam.IGrantable, aws-cdk-lib.aws_ec2.IConnectable

Packager for creating Lambda layers for Java dependencies in AWS.

Nothing is done locally so this doesn't require Docker and doesn't upload huge files to S3.

#### Initializers <a name="Initializers" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer"></a>

```typescript
import { JavaDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

new JavaDependencyPackager(scope: Construct, id: string, props?: DependencyPackagerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer.parameter.props">props</a></code> | <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.Initializer.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.layerFromMaven">layerFromMaven</a></code> | Create a layer for dependencies defined in pom.xml installed with Maven. |

---

##### `toString` <a name="toString" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `layerFromMaven` <a name="layerFromMaven" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.layerFromMaven"></a>

```typescript
public layerFromMaven(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in pom.xml installed with Maven.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.layerFromMaven.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.layerFromMaven.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.layerFromMaven.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.isConstruct"></a>

```typescript
import { JavaDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

JavaDependencyPackager.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | The network connections associated with this resource. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

The network connections associated with this resource.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cloudsnorkel/cdk-turbo-layers.JavaDependencyPackager.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---


### NodejsDependencyPackager <a name="NodejsDependencyPackager" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager"></a>

- *Implements:* aws-cdk-lib.aws_iam.IGrantable, aws-cdk-lib.aws_ec2.IConnectable

Packager for creating Lambda layers for Node.js dependencies in AWS. Nothing is done locally so this doesn't require Docker, doesn't download any packages and doesn't upload huge files to S3.

#### Initializers <a name="Initializers" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer"></a>

```typescript
import { NodejsDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

new NodejsDependencyPackager(scope: Construct, id: string, props?: DependencyPackagerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer.parameter.props">props</a></code> | <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.Initializer.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromInline">layerFromInline</a></code> | Create a layer for dependencies passed as an argument and installed with npm. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromPackageJson">layerFromPackageJson</a></code> | Create a layer for dependencies defined in package.json and (optionally) package-lock.json and installed with npm. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromYarn">layerFromYarn</a></code> | Create a layer for dependencies defined in package.json and yarn.lock and installed with yarn. |

---

##### `toString` <a name="toString" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `layerFromInline` <a name="layerFromInline" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromInline"></a>

```typescript
public layerFromInline(id: string, libraries: string[], props?: LayerProps): LayerVersion
```

Create a layer for dependencies passed as an argument and installed with npm.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromInline.parameter.id"></a>

- *Type:* string

---

###### `libraries`<sup>Required</sup> <a name="libraries" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromInline.parameter.libraries"></a>

- *Type:* string[]

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromInline.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

##### `layerFromPackageJson` <a name="layerFromPackageJson" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromPackageJson"></a>

```typescript
public layerFromPackageJson(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in package.json and (optionally) package-lock.json and installed with npm.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromPackageJson.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromPackageJson.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromPackageJson.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

##### `layerFromYarn` <a name="layerFromYarn" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromYarn"></a>

```typescript
public layerFromYarn(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in package.json and yarn.lock and installed with yarn.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromYarn.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromYarn.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.layerFromYarn.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.isConstruct"></a>

```typescript
import { NodejsDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

NodejsDependencyPackager.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | The network connections associated with this resource. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

The network connections associated with this resource.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cloudsnorkel/cdk-turbo-layers.NodejsDependencyPackager.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---


### PythonDependencyPackager <a name="PythonDependencyPackager" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager"></a>

- *Implements:* aws-cdk-lib.aws_iam.IGrantable, aws-cdk-lib.aws_ec2.IConnectable

Packager for creating Lambda layers for Python dependencies in AWS.

Nothing is done locally so this doesn't require Docker, doesn't download any packages and doesn't upload huge files to S3.

#### Initializers <a name="Initializers" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer"></a>

```typescript
import { PythonDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

new PythonDependencyPackager(scope: Construct, id: string, props?: DependencyPackagerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer.parameter.props">props</a></code> | <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.Initializer.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromInline">layerFromInline</a></code> | Create a layer for dependencies passed as an argument and installed with pip. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPipenv">layerFromPipenv</a></code> | Create a layer for dependencies defined in Pipfile and (optionally) Pipfile.lock and installed with pipenv. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPoetry">layerFromPoetry</a></code> | Create a layer for dependencies defined in pyproject.toml and (optionally) poetry.lock and installed with poetry. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromRequirementsTxt">layerFromRequirementsTxt</a></code> | Create a layer for dependencies defined in requirements.txt and installed with pip. |

---

##### `toString` <a name="toString" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `layerFromInline` <a name="layerFromInline" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromInline"></a>

```typescript
public layerFromInline(id: string, requirements: string[], props?: LayerProps): LayerVersion
```

Create a layer for dependencies passed as an argument and installed with pip.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromInline.parameter.id"></a>

- *Type:* string

---

###### `requirements`<sup>Required</sup> <a name="requirements" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromInline.parameter.requirements"></a>

- *Type:* string[]

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromInline.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

##### `layerFromPipenv` <a name="layerFromPipenv" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPipenv"></a>

```typescript
public layerFromPipenv(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in Pipfile and (optionally) Pipfile.lock and installed with pipenv.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPipenv.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPipenv.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPipenv.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

##### `layerFromPoetry` <a name="layerFromPoetry" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPoetry"></a>

```typescript
public layerFromPoetry(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in pyproject.toml and (optionally) poetry.lock and installed with poetry.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPoetry.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPoetry.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromPoetry.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

##### `layerFromRequirementsTxt` <a name="layerFromRequirementsTxt" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromRequirementsTxt"></a>

```typescript
public layerFromRequirementsTxt(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in requirements.txt and installed with pip.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromRequirementsTxt.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromRequirementsTxt.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.layerFromRequirementsTxt.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.isConstruct"></a>

```typescript
import { PythonDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

PythonDependencyPackager.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | The network connections associated with this resource. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

The network connections associated with this resource.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cloudsnorkel/cdk-turbo-layers.PythonDependencyPackager.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---


### RubyDependencyPackager <a name="RubyDependencyPackager" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager"></a>

- *Implements:* aws-cdk-lib.aws_iam.IGrantable, aws-cdk-lib.aws_ec2.IConnectable

Packager for creating Lambda layers for Ruby dependencies in AWS.

Nothing is done locally so this doesn't require Docker, doesn't download any packages and doesn't upload huge files to S3.

#### Initializers <a name="Initializers" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer"></a>

```typescript
import { RubyDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

new RubyDependencyPackager(scope: Construct, id: string, props?: DependencyPackagerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer.parameter.props">props</a></code> | <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.Initializer.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps">DependencyPackagerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.layerFromBundler">layerFromBundler</a></code> | Create a layer for dependencies defined in Gemfile and (optionally) Gemfile.lock and installed with Bundler. |

---

##### `toString` <a name="toString" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `layerFromBundler` <a name="layerFromBundler" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.layerFromBundler"></a>

```typescript
public layerFromBundler(id: string, path: string, props?: LayerProps): LayerVersion
```

Create a layer for dependencies defined in Gemfile and (optionally) Gemfile.lock and installed with Bundler.

###### `id`<sup>Required</sup> <a name="id" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.layerFromBundler.parameter.id"></a>

- *Type:* string

---

###### `path`<sup>Required</sup> <a name="path" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.layerFromBundler.parameter.path"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.layerFromBundler.parameter.props"></a>

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps">LayerProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.isConstruct"></a>

```typescript
import { RubyDependencyPackager } from '@cloudsnorkel/cdk-turbo-layers'

RubyDependencyPackager.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | The network connections associated with this resource. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal to grant permissions to. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

The network connections associated with this resource.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cloudsnorkel/cdk-turbo-layers.RubyDependencyPackager.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal to grant permissions to.

---


## Structs <a name="Structs" id="Structs"></a>

### DependencyPackagerProps <a name="DependencyPackagerProps" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps"></a>

#### Initializer <a name="Initializer" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.Initializer"></a>

```typescript
import { DependencyPackagerProps } from '@cloudsnorkel/cdk-turbo-layers'

const dependencyPackagerProps: DependencyPackagerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | Target Lambda architecture. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.logRemovalPolicy">logRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Removal policy for logs of image builds. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.preinstallCommands">preinstallCommands</a></code> | <code>string[]</code> | Additional commands to run before installing packages. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | Target Lambda runtime. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.subnetSelection">subnetSelection</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | VPC subnets used for packager. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.type">type</a></code> | <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType">DependencyPackagerType</a></code> | Type of dependency packager. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC used for packager. |

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

Target Lambda architecture.

Packages will be installed for this architecture so make sure it fits your Lambda functions.

---

##### `logRemovalPolicy`<sup>Optional</sup> <a name="logRemovalPolicy" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.logRemovalPolicy"></a>

```typescript
public readonly logRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.DESTROY

Removal policy for logs of image builds.

If deployment fails on the custom resource, try setting this to `RemovalPolicy.RETAIN`. This way logs can still be viewed, and you can see why the build failed.

We try to not leave anything behind when removed. But sometimes a log staying behind is useful.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.ONE_MONTH

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

---

##### `preinstallCommands`<sup>Optional</sup> <a name="preinstallCommands" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.preinstallCommands"></a>

```typescript
public readonly preinstallCommands: string[];
```

- *Type:* string[]
- *Default:* []

Additional commands to run before installing packages.

Use this to authenticate your package repositories like CodeArtifact.

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

Target Lambda runtime.

Packages will be installed for this runtime so make sure it fits your Lambda functions.

---

##### `subnetSelection`<sup>Optional</sup> <a name="subnetSelection" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.subnetSelection"></a>

```typescript
public readonly subnetSelection: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* default subnets, if VPC is used

VPC subnets used for packager.

---

##### `type`<sup>Optional</sup> <a name="type" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.type"></a>

```typescript
public readonly type: DependencyPackagerType;
```

- *Type:* <a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType">DependencyPackagerType</a>
- *Default:* {@link DependencyPackagerType.LAMBDA }

Type of dependency packager.

Use Lambda for speed and CodeBuild for complex dependencies that require building native extensions.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* no VPC

VPC used for packager.

Use this if your package repositories are only available from within a VPC.

---

### LayerProps <a name="LayerProps" id="@cloudsnorkel/cdk-turbo-layers.LayerProps"></a>

#### Initializer <a name="Initializer" id="@cloudsnorkel/cdk-turbo-layers.LayerProps.Initializer"></a>

```typescript
import { LayerProps } from '@cloudsnorkel/cdk-turbo-layers'

const layerProps: LayerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.LayerProps.property.alwaysRebuild">alwaysRebuild</a></code> | <code>boolean</code> | Always rebuild the layer, even when the dependencies definition files haven't changed. |

---

##### `alwaysRebuild`<sup>Optional</sup> <a name="alwaysRebuild" id="@cloudsnorkel/cdk-turbo-layers.LayerProps.property.alwaysRebuild"></a>

```typescript
public readonly alwaysRebuild: boolean;
```

- *Type:* boolean
- *Default:* false

Always rebuild the layer, even when the dependencies definition files haven't changed.

---



## Enums <a name="Enums" id="Enums"></a>

### DependencyPackagerType <a name="DependencyPackagerType" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType"></a>

Type of dependency packager.

This affects timeouts and capabilities of the packager.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType.LAMBDA">LAMBDA</a></code> | Use Lambda function to package dependencies. |
| <code><a href="#@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType.CODEBUILD">CODEBUILD</a></code> | Use CodeBuild to package dependencies. |

---

##### `LAMBDA` <a name="LAMBDA" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType.LAMBDA"></a>

Use Lambda function to package dependencies.

It is much faster than the alternative, but limited to 15 minutes and can't build native extensions.

---


##### `CODEBUILD` <a name="CODEBUILD" id="@cloudsnorkel/cdk-turbo-layers.DependencyPackagerType.CODEBUILD"></a>

Use CodeBuild to package dependencies.

It is capable of everything your local machine can do, but takes a little longer to startup.

---

