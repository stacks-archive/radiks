import '../mocks/crypto';
import '../setup';

import UserGroup from '../../src/models/user-group';
import User from '../../src/models/user';
import GroupInvitation from '../../src/models/group-invitation';
import GenericGroupInvitation from '../../src/models/generic-group-invitation';
import SigningKey from '../../src/models/signing-key';
import { userGroupKeys, loadUserData } from '../../src/helpers';
import { TestModel, loginAs, loginAsNewUser } from '../helpers';
import { decrypt } from 'aes256';

test('it creates and activates a membership with the creator', async t => {
  const user = await User.createWithCurrentUser();
  const group = new UserGroup();
  await group.create();
  expect(group.privateKey).not.toBeFalsy();
  expect(group.attrs.privateKey).toBeFalsy();
  expect(group.attrs.signingKeyId).not.toBeFalsy();

  const signingKey = await SigningKey.findById(group.attrs.signingKeyId);
  expect(signingKey.attrs.userGroupId).toEqual(group._id);
  // expect(s)

  const [member] = group.attrs.members;
  expect(member.username).toEqual(user._id);
  const { inviteId } = member;

  const invitation = await GroupInvitation.findById(inviteId, {
    decrypt: false,
  });
  expect(invitation.attrs.userGroupId).not.toEqual(group._id);
  expect(invitation.attrs.signingKeyPrivateKey).not.toEqual(group.privateKey);
  expect(invitation.attrs.signingKeyId).not.toEqual(signingKey._id);

  await invitation.decrypt();
  expect(invitation.attrs.userGroupId).toEqual(group._id);
  expect(invitation.attrs.signingKeyPrivateKey).toEqual(group.privateKey);
  expect(invitation.attrs.signingKeyId).toEqual(signingKey._id);

  const { userGroups, signingKeys } = userGroupKeys();
  expect(userGroups[group._id]).toEqual(group.attrs.signingKeyId);
  expect(signingKeys[group.attrs.signingKeyId]).toEqual(group.privateKey);

  t();
}, 25000);

test('it signs and encrypts with group signing key', async t => {
  await User.createWithCurrentUser();
  const group = new UserGroup();
  await group.create();

  const model = new TestModel({ userGroupId: group._id });
  await model.save();

  expect(model.attrs.signingKeyId).toEqual(group.attrs.signingKeyId);
  t();
}, 30000);

test('it creates user-specific group invitation', async t => {
  const user = await User.createWithCurrentUser();
  const group = new UserGroup();
  await group.create();
  const username = user.attrs.username;
  const groupInvitation = await group.makeGroupMembership(username);

  // user can decrypt her own invitation
  const decryptedInvitation = await groupInvitation.decrypt();
  expect(decryptedInvitation.attrs.userGroupId).toEqual(group._id);
  t();
}, 30000);

test('it creates and activates generic group invitation', async t => {
  await User.createWithCurrentUser();
  const userData = loadUserData();
  const group = new UserGroup();
  await group.create();

  const {
    secretKey,
    attrs,
    _id,
  } = await GenericGroupInvitation.makeGenericInvitation(group);

  // can decrypt with secretKey
  const decrypted = decrypt(secretKey, attrs.invitationDetails);
  const parsed = JSON.parse(decrypted);
  expect(group._id).toEqual(parsed.userGroupId);

  // any user can activate
  const groupCount = group.attrs.members.length;
  await loginAsNewUser();
  await User.createWithCurrentUser();
  const invite = await GenericGroupInvitation.findById(_id);
  console.log('activiate now');
  await invite.activate(secretKey);
  console.log('activiated');

  // verify that new user was added.
  await group.fetch();
  expect(group.attrs.members.length).toEqual(groupCount + 1);

  t();
}, 30000);
