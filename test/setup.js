import 'mock-local-storage';
import crypto from 'crypto';
import { makeECPrivateKey } from 'blockstack/lib/keys';

import { configure } from '../src/config';

const appPrivateKey = makeECPrivateKey();

window.crypto = {
  getRandomValues: () => {
    const buf = Buffer.alloc(16);
    const bytes = crypto.randomBytes(16);
    buf.set(bytes);
    return buf;
  },
};

beforeAll(() => {
  configure({
    couchDBName: 'radiks-testing',
    couchDBUrl: 'http://localhost:5984',
  });

  const blockstackConfig = JSON.stringify({
    appPrivateKey,
  });

  global.localStorage.setItem('blockstack', blockstackConfig);
});
