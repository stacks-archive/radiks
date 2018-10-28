import '../mocks/crypto';
import '../setup';

import UserGroup from '../../src/models/user-group';
import User from '../../src/models/user';
import GroupInvitation from '../../src/models/group-invitation';
import SigningKey from '../../src/models/signing-key';
import { userGroupKeys } from '../../src/helpers';
import { TestModel } from '../helpers';

test('it creates and activates a membership with the creator', async (t) => {
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

  const invitation = await GroupInvitation.findById(inviteId, { decrypt: false });
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

test('it signs and encrypts with group signing key', async (t) => {
  await User.createWithCurrentUser();
  const group = new UserGroup();
  await group.create();

  const model = new TestModel({ userGroupId: group._id });
  await model.save();

  expect(model.attrs.signingKeyId).toEqual(group.attrs.signingKeyId);
  t();
}, 30000);
