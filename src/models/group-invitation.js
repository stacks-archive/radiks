import { loadUserData } from 'blockstack/lib/auth/authApp';

import Model from '../model';
import User from './user';
import GroupMembership from './group-membership';

export default class GroupInvitation extends Model {
  static schema = {
    userGroupId: String,
    signingKeyPrivateKey: String,
    signingKeyId: String,
  }

  static defaults = {
    updatable: false,
  }

  static async makeInvitation(username, userGroup) {
    const user = new User({ id: username });
    await user.fetch();
    const { publicKey } = user.attrs;
    const invitation = new this({
      userGroupId: userGroup.id,
      signingKeyPrivateKey: userGroup.privateKey,
      signingKeyId: userGroup.attrs.signingKeyId,
    });
    invitation.userPublicKey = publicKey;
    await invitation.save();
    return invitation;
  }

  async activate() {
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

  encryptionPrivateKey = () => loadUserData().appPrivateKey
}
