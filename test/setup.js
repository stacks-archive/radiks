import 'mock-local-storage';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import faker from 'faker';
import { UserSession, AppConfig } from 'blockstack';

import './mocks/crypto';
import { makeECPrivateKey } from 'blockstack/lib/keys';
import Model from '../src/model';
// import UserGroup from '../src/models/user-group';
import { configure } from '../src/config';

dotenv.load();

let mockSaveClient;
let mockFindClient;

jest.mock('../src/api', () => ({
  sendNewGaiaUrl: encrypted => new Promise(async (resolve) => {
    // console.log('sendNewGaiaUrl');
    if (!mockSaveClient) {
      // console.log('connecting - save');
      const { MongoClient } = require('mongodb');
      const url = 'mongodb://localhost:27017/radiks-test-server';
      mockSaveClient = await MongoClient.connect(url, { useNewUrlParser: true });
    }
    const collection = mockSaveClient.db().collection('radiks-testing-models');
    // console.log(encrypted);
    await collection.insertOne(encrypted);
    resolve();
  }),
  find: query => new Promise(async (resolve, reject) => {
    if (!mockFindClient) {
      const { MongoClient } = require('mongodb');
      // console.log('connecting - find');
      const url = 'mongodb://localhost:27017/radiks-test-server';
      mockFindClient = await MongoClient.connect(url, { useNewUrlParser: true });
    }
    const collection = mockFindClient.db().collection('radiks-testing-models');
    const results = await collection.find(query).toArray();
    resolve({ results });
  }),
  destroyModel: model => new Promise(async (resolve) => {
    if (!mockFindClient) {
      const { MongoClient } = require('mongodb');
      // console.log('connecting - find');
      const url = 'mongodb://localhost:27017/radiks-test-server';
      mockFindClient = await MongoClient.connect(url, {
        useNewUrlParser: true,
      });
    }
    const collection = mockFindClient
      .db()
      .collection('radiks-testing-models');
    await collection.deleteOne({ _id: model._id });
    return resolve(true);
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
let collectionClient;

beforeAll(async () => {
  const url = 'mongodb://localhost:27017/radiks-test-server';
  collectionClient = await MongoClient.connect(url, { useNewUrlParser: true });
  collection = collectionClient.db().collection('radiks-testing-models');
});

beforeEach(async () => {
  const userSession = new UserSession({
    appConfig: new AppConfig(['store_write', 'publish_data']),
  });
  configure({
    userSession,
  });
  try {
    await collection.drop();
  } catch (error) {
    // collection doesn't exist
  }
  const appPrivateKey = makeECPrivateKey();
  const blockstackConfig = JSON.stringify({
    version: '1.0.0',
    userData: {
      appPrivateKey,
      username: faker.name.findName(),
      gaiaHubConfig: {
        url_prefix: 'https://gaia.blockstack.org/hub/', // eslint-disable-line @typescript-eslint/camelcase
        address: '1Me2Zi84EioQJcwDg5Kjgy5YaXgqXjxJYS',
      },
      profile: {
        // TODO
      },
    },
  });

  global.localStorage.setItem('blockstack-session', blockstackConfig);
});

afterAll(async () => {
  // console.log('closing');
  try {
    await Promise.all([
      mockSaveClient.close(),
      collectionClient.close(),
      mockFindClient.close(),
    ]);
  } catch (error) {
    // nothing
  }
});
