import Model from '../src/model';
import { makeECPrivateKey } from 'blockstack';
import faker from 'faker';
import { GROUP_MEMBERSHIPS_STORAGE_KEY, clearStorage } from '../src/helpers';
import { GroupMembership, User } from '../src';

// import './setup';

export class TestModel extends Model {
  static schema = {
    name: {
      type: String,
      decrypted: true,
    },
    metadata: Object,
    tags: Array,
    number: Number,
    description: String,
  };
}

export const fakeModel = () => {
  const name = 'tester';
  const metadata = { a: 1 };
  const tags = ['tags'];
  const number = 4;
  const description = 'asdf';
  const model = new TestModel({
    name,
    metadata,
    tags,
    number,
    description,
  });
  return model;
};

export const loginAsNewUser = async () => {
  const appPrivateKey = makeECPrivateKey();
  const userData = {
    appPrivateKey,
    username: faker.name.findName(),
    profile: {
      // TODO
    },
  };
  await loginAs(userData);
};

export const loginAs = async userData => {
  const blockstackConfig = JSON.stringify({
    version: '1.0.0',
    userData,
  });

  global.localStorage.setItem('blockstack-session', blockstackConfig);
  clearStorage();
};
