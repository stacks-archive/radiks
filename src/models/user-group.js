import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadUserData } from 'blockstack/lib/auth/authApp';
import { connectToGaiaHub } from 'blockstack/lib/storage/hub';
import { encryptECIES } from 'blockstack/lib/encryption';

import Model from '../model';
import GroupMembership from './group-membership';

export default class UserGroup extends Model {
  static schema = {
    name: String,
    gaiaConfig: Object,
    members: {
      type: Array,
      decrypted: true,
    },
  }

  async create() {
    this.privateKey = makeECPrivateKey();
    const { username } = loadUserData();
    await this.makeGroupMembership(username);
    await this.save();
    return this;
  }

  async makeGroupMembership(username) {
    const groupMembership = new GroupMembership({
      userGroupId: this.id,
      username,
      groupPrivateKey: this.privateKey,
    });
    await groupMembership.save();
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
    return gaiaConfig;
  }
}
