import Model from '../model';
import User from './user';
import GroupMembership from './group-membership';
import UserGroup from './user-group';
import { userGroupKeys, loadUserData } from '../helpers';
import { Schema, Attrs } from '../types/index';

interface GroupInvitationAttrs extends Attrs {
  userGroupId?: string | Record<string, any>,
  signingKeyPrivateKey?: string | Record<string, any>,
}

export default class GroupInvitation extends Model {
  static className = 'GroupInvitation';
  userPublicKey: string;

  static schema: Schema = {
    userGroupId: String,
    signingKeyPrivateKey: String,
    signingKeyId: String,
  }

  static defaults = {
    updatable: false,
  }

  static async makeInvitation(username: string, userGroup: UserGroup) {
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
    const groupId: string = this.attrs.userGroupId as string;
    if (userGroups[groupId]) {
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

  async encryptionPublicKey() {
    return this.userPublicKey;
  }

  encryptionPrivateKey() {
    return loadUserData().appPrivateKey;
  }
}
