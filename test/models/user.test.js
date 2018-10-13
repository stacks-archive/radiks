import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadUserData } from 'blockstack/lib/auth/authApp';

import '../setup';
import User from '../../src/models/user';

describe(User, () => {
  test('creates currentUser from localStorage user', async (t) => {
    const user = User.currentUser();
    expect(user.attrs.username).toEqual('fakeuser.id');
    expect(user.id).toEqual('fakeuser.id');
    const { appPrivateKey } = loadUserData();
    const publicKey = getPublicKeyFromPrivate(appPrivateKey);
    expect(user.attrs.publicKey).toEqual(publicKey);
    t();
  });

  describe('createWithCurrentUser', () => {
    // test('saves a user', async (t) => {

    // });
  });
});
