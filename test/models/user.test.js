import '../mocks/crypto';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadUserData } from 'blockstack/lib/auth/authApp';

import '../setup';
import User from '../../src/models/user';
import SigningKey from '../../src/models/signing-key';

test('creates currentUser from localStorage user', async (t) => {
  const user = User.currentUser();
  expect(user.attrs.username).toEqual('fakeuser.id');
  expect(user.id).toEqual('fakeuser.id');
  const { appPrivateKey } = loadUserData();
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
  const oldkey = user.attrs.signingKeyId;
  expect(typeof oldkey).not.toBe('Object');
  await user.fetch();
  expect(user.attrs.signingKeyId).toEqual(oldkey);

  const savedUser = await User.findById(user.id, { decrypt: false });

  expect(savedUser.attrs.username).toEqual(user.attrs.username);
  expect(savedUser.attrs.profile).toEqual(user.attrs.profile);
  expect(savedUser.attrs._id).toEqual(user.attrs.username);

  expect(savedUser.attrs.signingKeyId).not.toEqual(user.attrs.signingKeyId);

  const signingKey = await SigningKey.findById(user.attrs.signingKeyId);
  expect(signingKey.id).toEqual(user.attrs.signingKeyId);
});

// test('saves a signing key', async (t) => {
//   const user = await User.createWithCurrentUser();
//   // console.log(user.attrs.signingKeyId);

//   t();
// });
// });
