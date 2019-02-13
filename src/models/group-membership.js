import { loadUserData } from 'blockstack/lib/auth/authApp';

import Model from '../model';
import User from './user';
import UserGroup from './user-group';
import { clearStorage, userGroupKeys, GROUP_MEMBERSHIPS_STORAGE_KEY } from '../helpers';
import SigningKey from './signing-key';

export default class GroupMembership extends Model {
  static className = 'GroupMembership';

  static schema = {
    userGroupId: String,
    username: {
      type: String,
      decrypted: true,
    },
    signingKeyPrivateKey: String,
    signingKeyId: String,
  }

  static async fetchUserGroups() {
    const { username } = loadUserData();
    const memberships = await GroupMembership.fetchList({
      username,
    });
    const signingKeys = {};
    memberships.forEach(({ attrs }) => {
      signingKeys[attrs.signingKeyId] = attrs.signingKeyPrivateKey;
    });
    const fetchAll = memberships.map(membership => membership.fetchUserGroupSigningKey());
    const userGroupList = await Promise.all(fetchAll);
    const userGroups = {};
    userGroupList.forEach((userGroup) => {
      userGroups[userGroup._id] = userGroup.signingKeyId;
    });
    return { userGroups, signingKeys };
  }

  static async cacheKeys() {
    const { userGroups, signingKeys } = await this.fetchUserGroups();
    const groupKeys = userGroupKeys();
    const self = await User.findById(loadUserData().username);
    const key = await SigningKey.findById(self.attrs.signingKeyId);
    groupKeys.personal = key.attrs;
    groupKeys.signingKeys = signingKeys;
    groupKeys.userGroups = userGroups;
    localStorage.setItem(GROUP_MEMBERSHIPS_STORAGE_KEY, JSON.stringify(groupKeys));
  }

  static async clearStorage() {
    clearStorage();
  }

  static userGroupKeys() {
    return userGroupKeys();
  }

  async encryptionPublicKey() {
    const user = await User.findById(this.attrs.username, { decrypt: false });
    const { publicKey } = user.attrs;
    return publicKey;
  }

  encryptionPrivateKey() {
    return loadUserData().appPrivateKey;
  }

  getSigningKey() {
    const { signingKeyId, signingKeyPrivateKey } = this.attrs;
    return {
      _id: signingKeyId,
      privateKey: signingKeyPrivateKey,
    };
  }

  async fetchUserGroupSigningKey() {
    const _id = this.attrs.userGroupId;
    const { signingKeyId } = (await UserGroup.findById(_id)).attrs;
    return {
      _id,
      signingKeyId,
    };
  }
}
