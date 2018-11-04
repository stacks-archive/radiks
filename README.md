# Radiks

A client-side framework for building model-driven decentralized applications on top of [Blockstack](https://blockstack.org) storage and authentication.

<!-- TOC depthFrom:2 -->

- [Why?](#why)
- [How?](#how)
  - [How authorization works](#how-authorization-works)
- [So, is it decentralized?](#so-is-it-decentralized)
- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Authentication](#authentication)
  - [Models](#models)
    - [Defining a model](#defining-a-model)
      - [Schema](#schema)
      - [Defaults](#defaults)
      - [Example](#example)
    - [Using models](#using-models)
      - [Constructing a model](#constructing-a-model)
      - [Fetching a model](#fetching-a-model)
      - [Accessing model attributes](#accessing-model-attributes)
      - [Updating a model](#updating-a-model)
      - [Saving a model](#saving-a-model)
    - [Querying models](#querying-models)
    - [Managing relational data](#managing-relational-data)
- [Development](#development)

<!-- /TOC -->

## Why?

There are already a number of great tools for building decentralized apps. Blockstack provides easy-to-use libraries for using decentralized authentication with a decentralized [key-value storage system](https://github.com/blockstack/gaia).

Some apps end up running into limitations when building complex applications, though. This library aims to solve a few of those problems, such as:

- Storing and querying complex data
- Indexing data to easily query user's publicly saved data
- Collaboration with other users
- Real-time updates (in progress)

## How?

The crux of radiks is that it's built to be used with [Radiks-server](https://github.com/hstove/radiks-server), which is an indexing server for decentralized apps. Whenever a users saves or updates a model, radiks follows this process:

1. Encrypt private data on the client-side
2. Save a raw JSON version of this encrypted data in [Gaia](https://github.com/blockstack/gaia)
3. Store the encrypted data in [Radiks-server](https://github.com/hstove/radiks-server), making it easy to query in the future.

### How authorization works

Application developer's don't want users to have full control over writes to their database. Instead, users should only be able to write to data that they explicitly 'own'. To do this, Radiks creates 'signing keys', and signs all data using this signing key. The indexing server, Radiks-server, will only allow writes that are appropriately signed. [Learn more about authorization](https://github.com/hstove/radiks-server/tree/master#authorization)

## So, is it decentralized?

Although radiks applications rely on a centrally-hosted database, it is still fundamentally a decentralized application. It checks off these boxes:

- No data lock-in.
  - Because all data is also stored in Gaia, the user still controls a 'copy' of their data for as long as they need to. If the application server shuts down, the user can still access their data. It also makes it easy to backup or migrate their data at any time. [Learn more about Gaia](https://github.com/blockstack/gaia)
- Censorship resistance
  - Again, because all data is also stored in Gaia, no party can revoke access to this data at any time.
- Maximum privacy 
  - Because all data is encrypted on the client side before being stored anywhere, the application host cannot inspect, sell, or use your data in any way that you don't explicitly authorize
- Built on decentralized authentication
  - Radiks is deeply tied to Blockstack authentication, which uses a blockchain and Gaia to give you full control over your user data. [Learn more about Blockstack auth](https://github.com/blockstack/blockstack.js/blob/master/src/auth/README.md)

## Installation

To get started, first setup CouchDB and a radiks server. Check out the `radiks-server` documentation for more information.

In your client-side code, install the `radiks` package:

~~~bash
yarn add radiks
## or
npm install --save radiks
~~~

## Usage

### Configuration

To set up radiks.js, you only need to configure the URL that your Radiks-server instance is running on. If you're using the pre-built Radiks server, this will be `http://localhost:1260`. If you're in production or are using a custom Radiks server, you'll need to specify exactly which URL it's available at.

To configure radiks, use code that looks like this when starting up your application:

~~~javascript
import { configure } from 'radiks';

configure({
  apiServer: 'http://my-radiks-server.com'
});
~~~

### Authentication

Most of your code will be informed by following [Blockstack's authentication documentation](https://github.com/blockstack/blockstack.js/blob/master/src/auth/README.md).

After your user logs in with Blockstack, you'll have some code to save the user's data in localStorage. It will probably look like this:

~~~javascript
import * as Blockstack from 'blockstack';
import { User } from 'radiks';

const handleSignIn = () => {
  if (blockstack.isSignInPending()) {
    await blockstack.handlePendingSignIn();
    await User.createWithCurrentUser();
  }
}
~~~

Calling `User.createWithCurrentUser` will do a few things:

1. Fetch user data that Blockstack.js stores in `localStorage`
2. Save the user's public data (including their public key) in Radiks-server
3. Find or create a signing key that is used to authorize writes on behalf of this user
4. Cache the user's signing key (and any group-related signing keys) to make signatures and decryption happen quickly later on

### Models

Creating models for your application's data is where radiks truly becomes helpful. We provide a `Model` class that you can extend to easily create, save, and fetch models.

#### Defining a model

To create a model class, first import the `Model` class from radiks. Then, create a class that extends this model, and provide a schema.

##### Schema

The first static property you'll need to define is a schema. Create a static `schema` property on your class to define it. Each `key` in this object is the name of the field. The value is whatever type you want the field to be, or you can pass some options.

If you don't want to include any options, just pass the class for that field, like `String`, `Boolean`, or `Number`.

To include options, pass an object, with a mandatory `type` field. The only supported option right now is `decrypted`. This defaults to `false`, but if you provide `true`, then this field will not be encrypted before storing data publicly. This is useful if you want to be able to query this field when fetching data.

**Important**: do not add the `decrypted` option to fields that contain sensitive user data. Remember, because this is decentralized storage, anyone can read the user's data. That's why encrypting it is so important. If you want to be able to filter sensitive data, then you should do it on the client-side, after decrypting it. A good use-case for storing decrypted fields is to store a `foreignId` that references a different model, for a "belongs-to" type of relation.

##### Defaults

Include an optional `defaults` static property to define default values for a field.

##### Example

~~~javascript
import Model from 'radiks/lib/model';

class Person extends Model {
  static schema = {
    name: String,
    age: Number,
    isHuman: Boolean,
    likesDogs: {
      type: Boolean,
      decrypted: true // all users will know if this record likes dogs!
    }
  }

  static defaults = {
    likesDogs: true
  }
}
~~~

#### Using models

All model instances have an `_id` attribute. If you don't pass an `_id` to the model (when constructing it), then an `_id` will be created automatically using [`uuid/v4`](https://github.com/kelektiv/node-uuid). This `_id` is used as a primary key when storing data, and would be used for fetching this model in the future.

In addition to automatically creating an `_id` attribute, radiks also creates a `createdAt` and `updatedAt` property when creating and saving models.

##### Constructing a model

To create an instance of a model, pass some attributes to the constructor of that class:

~~~javascript
const person = new Person({
  name: 'Hank',
  isHuman: false,
  likesDogs: false // just an example, I love dogs!
})
~~~

##### Fetching a model

To fetch an existing model, first construct it with a required `id` property. Then, call the `fetch()` function, which returns a promise.

~~~javascript
const person = await Person.findById('404eab3a-6ddc-4ba6-afe8-1c3fff464d44');
~~~

After calling `fetch`, radiks will automatically decrypt all encrypted fields.

##### Accessing model attributes

All attributes (other than `id`) are stored in an `attrs` property on the model.

~~~javascript
const { name, likesDogs } = person.attrs;
console.log(`Does ${name} like dogs?`, likesDogs);
~~~

##### Updating a model

To quickly update multiple attributes of a model, pass those attributes to the `update` function.

~~~javascript
const newAttributes = {
  likesDogs: false,
  age: 30
}
person.update(newAttributes)
~~~

Note that calling `update` does **not** save the model.

##### Saving a model

To save a model to Gaia and CouchDB, call the `save` function. First, it encrypts all attributes that do not have the `decrypted` option in their schema. Then, it saves a JSON representation of the model in Gaia, as well as in CouchDB. `save` returns a promise.

~~~javascript
await person.save();
~~~

#### Querying models

To fetch multiple records that match a certain query, use the class's `fetchList` function. This method creates an HTTP query to Radiks-server, which then queries the underlying database. Radiks-server uses the [`query-to-mongo`](https://github.com/pbatey/query-to-mongo) package to turn an HTTP query into a MongoDB query. Read the documentation for that package to learn how to do complex querying, sorting, limiting, etc.

Here are some examples:

~~~javascript
const dogHaters = Person.fetchList({ likesDogs: false });
~~~

Or, imagine a `Task` model with a `name`, a boolean for `completed`, and an `order` attribute.

~~~javascript
class Task extends Model {
  static schema = {
    name: String,
    completed: {
      type: Boolean,
      decrypted: true,
    },
    order: {
      type: Number,
      decrypted: true,
    }
  }
}

const tasks = await Task.fetchList({
  completed: false,
  sort: '-order'
})
~~~

#### Managing relational data

It is common for applications to have multiple different models, where some reference another. For example, imagine a task-tracking application where a user has multiple projects, and each project has multiple tasks. Here's what those models might look like:

~~~javascript
class Project extends Model {
  static schema = { name: String }
}

class Task extends Model {
  static schema = {
    name: String,
    projectId: {
      type: String,
      decrypted: true,
    }
    completed: Boolean
  }
}
~~~

Whenever you save a task, you'll want to save a reference to the project it's in:

~~~javascript
const task = new Task({
  name: 'Improve radiks documentation',
  projectId: project._id
})
await task.save();
~~~

Then, later you'll want to fetch all tasks for a certain project:

~~~javascript
const tasks = await Task.fetchList({
  projectId: project._id,
})
~~~

Radiks lets you define an `afterFetch` method, which you can use to automatically fetch child records when you fetch the parent instance.

~~~javascript
class Project extends Model {
  static schema = { name: String }

  async afterFetch() {
    this.tasks = await Task.fetchList({
      projectId: this.id,
    })
  }
}

const project = await Project.findById('some-id-here');
console.log(project.tasks); // will already have fetch and decrypted all related tasks
~~~

## Development

To compile with babel, make sure you've installed `@babel/core` globally. Then, run

~~~bash
yarn compile
~~~