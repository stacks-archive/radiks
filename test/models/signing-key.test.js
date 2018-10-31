import '../mocks/crypto';
import '../setup';
import SigningKey from '../../src/models/signing-key';

test('it defaults to updatable: false ', async () => {
  const key = await SigningKey.create();
  expect(key.attrs.updatable).toEqual(false);
});

test('it creates a key with private and public key', async () => {
  const key = await SigningKey.create();
  expect(key.attrs.publicKey).not.toBeFalsy();
  expect(key.attrs.privateKey).not.toBeFalsy();
});

test('it encrypts the private key only', async () => {
  const key = await SigningKey.create();
  const encrypted = await key.encrypted();
  expect(encrypted.privateKey).not.toBeFalsy();
  expect(encrypted.privateKey).not.toEqual(key.attrs.privateKey);
  expect(encrypted.updatable).toEqual(false);
});

test('it allows a userGroupId', async () => {
  const userGroupId = 'asdf';
  const key = await SigningKey.create({ userGroupId });
  const encrypted = await key.encrypted();
  expect(encrypted.userGroupId).toEqual(userGroupId);
  expect(key.attrs.userGroupId).toEqual(userGroupId);
});
