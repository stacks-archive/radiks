import 'mock-local-storage';
import dotenv from 'dotenv';
import PouchDB from 'pouchdb';

import './mocks/crypto';
import { makeECPrivateKey } from 'blockstack/lib/keys';
import Model from '../src/model';
import UserGroup from '../src/models/user-group';
import { configure } from '../src/config';

dotenv.load();

jest.mock('../src/api', () => ({
  sendNewGaiaUrl: encrypted => new Promise(async (resolve) => {
    const PouchDB = require('pouchdb');
    const username = process.env.COUCHDB_USERNAME;
    const password = process.env.COUCHDB_PASSWORD;
    const db = new PouchDB('http://localhost:5984/radiks-local-testing', {
      auth: {
        username,
        password,
      },
    });
    encrypted._id = encrypted.id;
    const doc = await db.put(encrypted);
    resolve(doc);
  }),
}));

const appPrivateKey = makeECPrivateKey();

Model.prototype.saveFile = jest.fn(encrypted => new Promise(async (resolve) => {
  process.nextTick(() => {
    resolve(encrypted);
  });
}));

UserGroup.prototype.makeGaiaConfig = () => new Promise(async (resolve) => {
  process.nextTick(() => {
    resolve();
  });
});

beforeAll(async (t) => {
  jest.setTimeout(20000);
  let db = new PouchDB('http://localhost:5984/radiks-local-testing', {
    auth: {
      username: process.env.COUCHDB_USERNAME,
      password: process.env.COUCHDB_PASSWORD,
    },
  });
  await db.destroy();
  db = new PouchDB('http://localhost:5984/radiks-local-testing');
  configure({
    couchDBName: 'radiks-local-testing',
    couchDBUrl: 'http://localhost:5984',
  });

  const blockstackConfig = JSON.stringify({
    appPrivateKey,
    username: 'fakeuser.id',
    profile: {
      // TODO
    },
  });

  global.localStorage.setItem('blockstack', blockstackConfig);
  setTimeout(200, () => t());
});

beforeEach(async () => {
  const db = new PouchDB('http://localhost:5984/radiks-local-testing', {
    auth: {
      username: process.env.COUCHDB_USERNAME,
      password: process.env.COUCHDB_PASSWORD,
    },
  });
  try {
    const doc = await db.get('fakeuser.id');
    await db.remove(doc);
  } catch (error) { } // eslint-disable-line no-empty
});
