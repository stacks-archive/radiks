import { loadUserData } from 'blockstack/lib/auth/authApp';

import Model from '../model';
import User from './user';
import GroupMembership from './group-membership';
import { userGroupKeys } from '../helpers';

export default class GroupInvitation extends Model {
  static className = 'GroupInvitation';

  static schema = {
    userGroupId: String,
    signingKeyPrivateKey: String,
    signingKeyId: String,
  }

  static defaults = {
    updatable: false,
  }

  static async makeInvitation(username, userGroup) {
    const user = new User({ _id: username });
    await user.fetch({ decrypt: false });
    const { publicKey } = user.attrs;
    const invitation = new this({
      userGroupId: userGroup._id,
      signingKeyPrivateKey: userGroup.privateKey,
      signingKeyId: userGroup.attrs.signingKeyId,
    });
    invitation.userPublicKey = publicKey;
    await invitation.save();
    return invitation;
  }

  async activate() {
    const { userGroups } = userGroupKeys();
    if (userGroups[this.attrs.userGroupId]) {
      return true;
    }
    const groupMembership = new GroupMembership({
      userGroupId: this.attrs.userGroupId,
      username: loadUserData().username,
      signingKeyPrivateKey: this.attrs.signingKeyPrivateKey,
      signingKeyId: this.attrs.signingKeyId,
    });
    await groupMembership.save();
    await GroupMembership.cacheKeys();
    return groupMembership;
  }

  encryptionPublicKey() {
    return this.userPublicKey;
  }

  encryptionPrivateKey() {
    return loadUserData().appPrivateKey;
  }
}
