import 'mock-local-storage';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import faker from 'faker';

import './mocks/crypto';
import { makeECPrivateKey } from 'blockstack/lib/keys';
import Model from '../src/model';
// import UserGroup from '../src/models/user-group';
// import { configure } from '../src/config';

dotenv.load();

jest.mock('../src/api', () => ({
  sendNewGaiaUrl: encrypted => new Promise(async (resolve) => {
    // console.log('sendNewGaiaUrl');
    const { MongoClient } = require('mongodb');
    const url = 'mongodb://localhost:27017/radiks-test-server';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const collection = client.db().collection('radiks-testing-models');
    // console.log(encrypted);
    await collection.insertOne(encrypted);
    resolve();
  }),
  find: query => new Promise(async (resolve, reject) => {
    const { MongoClient } = require('mongodb');
    const url = 'mongodb://localhost:27017/radiks-test-server';
    const client = await MongoClient.connect(url, { useNewUrlParser: true });
    const collection = client.db().collection('radiks-testing-models');
    const results = await collection.find(query).toArray();
    resolve({ results });
  }),
}));

Model.prototype.saveFile = jest.fn(encrypted => new Promise(async (resolve) => {
  process.nextTick(() => {
    resolve(encrypted);
  });
}));

// UserGroup.prototype.makeGaiaConfig = () => new Promise(async (resolve) => {
//   process.nextTick(() => {
//     resolve();
//   });
// });

let collection;

beforeAll(async () => {
  const url = 'mongodb://localhost:27017/radiks-test-server';
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  collection = client.db().collection('radiks-testing-models');
});

beforeEach(async () => {
  try {
    await collection.drop();
  } catch (error) {
    // collection doesn't exist
  }
  const appPrivateKey = makeECPrivateKey();
  const blockstackConfig = JSON.stringify({
    appPrivateKey,
    username: faker.name.findName(),
    profile: {
      // TODO
    },
  });

  global.localStorage.setItem('blockstack', blockstackConfig);
});
