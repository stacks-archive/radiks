import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadUserData } from 'blockstack/lib/auth/authApp';
import { connectToGaiaHub } from 'blockstack/lib/storage/hub';

import Model from '../model';
import GroupMembership from './group-membership';

export default class UserGroup extends Model {
  static schema = {
    name: String,
    gaiaConfig: Object,
    members: {
      type: Array,
    },
  }

  static defaults = {
    members: [],
  }

  static async find(id) {
    const keys = GroupMembership.userGroupKeys();
    if (!keys || !keys[id]) {
      throw new Error(`UserGroup not found with id: '${id}'. Have you called \`GroupMembership.cacheKeys()\`?`);
    }
    const privateKey = keys[id];
    const userGroup = new this({ id });
    userGroup.privateKey = privateKey;
    await userGroup.fetch();
    return userGroup;
  }

  async create() {
    this.privateKey = makeECPrivateKey();
    this.makeGaiaConfig();
    const { username } = loadUserData();
    await this.makeGroupMembership(username);
    return this;
  }

  async makeGroupMembership(username) {
    const groupMembership = new GroupMembership({
      userGroupId: this.id,
      username,
      groupPrivateKey: this.privateKey,
    });
    this.attrs.members.push({
      username,
    });
    await groupMembership.save();
    await this.save();
    GroupMembership.cacheKeys();
    return groupMembership;
  }

  publicKey() {
    return getPublicKeyFromPrivate(this.privateKey);
  }

  encryptionPublicKey() {
    return this.publicKey();
  }

  async makeGaiaConfig() {
    const userData = loadUserData();
    const { appPrivateKey, hubUrl } = userData;
    const scopes = [
      {
        scope: 'putFilePrefix',
        domain: `UserGroups/${this.id}/`,
      },
    ];
    const gaiaConfig = await connectToGaiaHub(hubUrl, appPrivateKey, scopes);
    this.attrs.gaiaConfig = gaiaConfig;
    return gaiaConfig;
  }
}
