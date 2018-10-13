import 'mock-local-storage';
import dotenv from 'dotenv';

import './mocks/crypto';
import { makeECPrivateKey } from 'blockstack/lib/keys';
import Model from '../src/model';
import { configure } from '../src/config';

dotenv.load();

jest.mock('../src/api', () => ({
  sendNewGaiaUrl: encrypted => new Promise(async (resolve) => {
    // console.log('fake send gaia');
    // console.log(process.env.COUCHDB_USERNAME);
    // console.log(process.env.COUCHDB_PASSWORD);
    const PouchDB = require('pouchdb');
    const db = new PouchDB('http://localhost:5984/radiks-testing', {
      auth: {
        username: process.env.COUCHDB_USERNAME,
        password: process.env.COUCHDB_PASSWORD,
      },
    });
    encrypted._id = encrypted.id;
    const doc = await db.put(encrypted);
    resolve({
      success: true,
      doc,
    });
  }),
}));

const appPrivateKey = makeECPrivateKey();

Model.prototype.saveFile = jest.fn(encrypted => new Promise(async (resolve) => {
  // console.log('fake save', this);
  process.nextTick(() => {
    resolve(encrypted);
  });
}));

beforeAll(() => {
  configure({
    couchDBName: 'radiks-testing',
    couchDBUrl: 'http://localhost:5984',
    apiServer: 'http://localhost:7654',
  });

  const blockstackConfig = JSON.stringify({
    appPrivateKey,
    username: 'fakeuser.id',
    profile: {
      // TODO
    },
  });

  global.localStorage.setItem('blockstack', blockstackConfig);
});
