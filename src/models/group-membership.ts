import Model from '../model';
import User from './user';
import UserGroup from './user-group';
import {
  clearStorage, userGroupKeys, GROUP_MEMBERSHIPS_STORAGE_KEY, loadUserData,
} from '../helpers';
import SigningKey from './signing-key';
import { Attrs } from '../types/index';

interface UserGroupKeys {
  userGroups: {
    [userGroupId: string]: string,
  },
  signingKeys: {
    [signingKeyId: string]: string
  }
}

export default class GroupMembership extends Model {
  static className = 'GroupMembership';
  static schema = {
    userGroupId: String,
    username: {
      type: String,
      decrypted: true,
    },
    signingKeyPrivateKey: String,
    signingKeyId: {
      type: String,
      decrypted: true,
    },
  }

  static async fetchUserGroups(): Promise<UserGroupKeys> {
    const { username } = loadUserData();
    const memberships: GroupMembership[] = await GroupMembership.fetchList({
      username,
    });
    const signingKeys: UserGroupKeys['signingKeys'] = {};
    memberships.forEach(({ attrs }) => {
      signingKeys[attrs.signingKeyId] = attrs.signingKeyPrivateKey;
    });
    const fetchAll = memberships.map(membership => membership.fetchUserGroupSigningKey());
    const userGroupList = await Promise.all(fetchAll);
    const userGroups: UserGroupKeys['userGroups'] = {};
    userGroupList.forEach((userGroup) => {
      userGroups[userGroup._id] = userGroup.signingKeyId;
    });
    return { userGroups, signingKeys };
  }

  static async cacheKeys() {
    const { userGroups, signingKeys } = await this.fetchUserGroups();
    const groupKeys = userGroupKeys();
    const self = await User.findById(loadUserData().username);
    const key = await SigningKey.findById(self.attrs.personalSigningKeyId);
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
    const { signingKeyId, signingKeyPrivateKey }: {
      signingKeyId?: string,
      signingKeyPrivateKey?: string
    } = this.attrs;
    return {
      _id: signingKeyId,
      privateKey: signingKeyPrivateKey,
    };
  }

  async fetchUserGroupSigningKey() {
    const _id: string = this.attrs.userGroupId;
    const userGroup = await UserGroup.findById<UserGroup>(_id) as UserGroup;
    const { signingKeyId }: {
      signingKeyId?: string
    } = userGroup.attrs;
    return {
      _id,
      signingKeyId,
    };
  }
}
