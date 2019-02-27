import '../mocks/crypto';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import * as blockstack from 'blockstack';

import '../setup';
import User from '../../src/models/user';
import SigningKey from '../../src/models/signing-key';

test('creates currentUser from localStorage user', async (t) => {
  const user = User.currentUser();
  const { username } = blockstack.loadUserData();
  expect(user.attrs.username).toEqual(username);
  expect(user._id).toEqual(username);
  const { appPrivateKey } = blockstack.loadUserData();
  const publicKey = getPublicKeyFromPrivate(appPrivateKey);
  expect(user.attrs.publicKey).toEqual(publicKey);
  t();
});

test('encrypts user signing key with their own private key', async (t) => {
  const user = User.currentUser();
  await user.createSigningKey();
  const encrypted = await user.encrypted();
  const foundUser = new User(encrypted);
  await foundUser.decrypt();
  expect(foundUser.attrs.signingKeyId).toEqual(user.attrs.signingKeyId);
  t();
});

test('saves a user with a signing key', async () => {
  const user = await User.createWithCurrentUser();
  const oldkey = user.attrs.personalSigningKeyId;
  expect(typeof oldkey).not.toBe('Object');
  await user.fetch();
  expect(user.attrs.personalSigningKeyId).toEqual(oldkey);

  const savedUser = await User.findById(user._id, { decrypt: false });

  expect(savedUser.attrs.username).toEqual(user.attrs.username);
  expect(savedUser.attrs.profile).toEqual(user.attrs.profile);
  expect(savedUser.attrs._id).toEqual(user.attrs.username);

  expect(savedUser.attrs.personalSigningKeyId).not.toEqual(user.attrs.personalSigningKeyId);

  const signingKey = await SigningKey.findById(user.attrs.personalSigningKeyId);
  expect(signingKey._id).toEqual(user.attrs.personalSigningKeyId);
});
