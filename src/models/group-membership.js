import { loadUserData } from 'blockstack/lib/auth/authApp';

import Model from '../model';
import User from './user';
import UserGroup from './user-group';
import { clearStorage, userGroupKeys, GROUP_MEMBERSHIPS_STORAGE_KEY } from '../helpers';

export default class GroupMembership extends Model {
  static schema = {
    userGroupId: String,
    username: {
      type: String,
      decrypted: true,
    },
    groupPrivateKey: Object,
  }

  static async fetchUserGroups() {
    const { username } = loadUserData();
    const memberships = await GroupMembership.fetchList({
      username,
    });
    const fetchAll = memberships.map(membership => membership.fetchUserGroup());
    const userGroups = await Promise.all(fetchAll);
    const byId = {};
    userGroups.forEach((userGroup) => {
      byId[userGroup.id] = userGroup;
    });
    return byId;
  }

  static async cacheKeys() {
    const userGroups = await this.fetchUserGroups();
    const groupKeys = {};
    Object.keys(userGroups).forEach((id) => {
      const group = userGroups[id];
      groupKeys[id] = group.privateKey;
    });
    localStorage.setItem(GROUP_MEMBERSHIPS_STORAGE_KEY, JSON.stringify(groupKeys));
  }

  static async clearStorage() {
    clearStorage();
  }

  static userGroupKeys() {
    userGroupKeys();
  }

  async encryptionPublicKey() {
    const user = new User({ id: this.attrs.username });
    await user.fetch();
    const { publicKey } = user.attrs;
    return publicKey;
  }

  encryptionPrivateKey = () => loadUserData().appPrivateKey

  async fetchUserGroup() {
    const selector = {
      radiksType: 'UserGroup',
      _id: this.attrs.userGroupId,
    };
    const { docs } = await this.constructor.db().find({
      selector,
    });
    const [attrs] = docs;
    const userGroup = new UserGroup(attrs);
    userGroup.privateKey = this.attrs.groupPrivateKey;
    await userGroup.decrypt();
    return userGroup;
  }
}
