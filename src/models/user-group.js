import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadUserData } from 'blockstack/lib/auth/authApp';
import { connectToGaiaHub } from 'blockstack/lib/storage/hub';

import Model from '../model';
import GroupMembership from './group-membership';
import GroupInvitation from './group-invitation';
import SigningKey from './signing-key';
import { userGroupKeys, addUserGroupKey } from '../helpers';

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
    // this.privateKey = makeECPrivateKey();
    const signingKey = await SigningKey.create({ userGroupId: this._id });
    this.attrs.signingKeyId = signingKey._id;
    this.privateKey = signingKey.attrs.privateKey;
    addUserGroupKey(this);
    // await this.makeGaiaConfig();
    const { username } = loadUserData();
    // console.log('making group membership');
    const invitation = await this.makeGroupMembership(username);
    // console.log(invitation);
    await invitation.activate();
    return this;
  }

  async makeGroupMembership(username) {
    const invitation = await GroupInvitation.makeInvitation(username, this);
    // invitation.activate();
    this.attrs.members.push({
      username,
      inviteId: invitation._id,
    });
    await this.save();
    return invitation;
  }

  static myGroups() {
    const { userGroups } = userGroupKeys();
    const keys = Object.keys(userGroups);
    return this.fetchList({ _id: keys.join(',') });
  }

  publicKey() {
    return getPublicKeyFromPrivate(this.privateKey);
  }

  encryptionPublicKey() {
    return this.publicKey();
  }

  encryptionPrivateKey() {
    const { signingKeys } = userGroupKeys();
    return signingKeys[this.attrs.signingKeyId];
  }

  async makeGaiaConfig() {
    const userData = loadUserData();
    const { appPrivateKey, hubUrl } = userData;
    const scopes = [
      {
        scope: 'putFilePrefix',
        domain: `UserGroups/${this._id}/`,
      },
    ];
    const gaiaConfig = await connectToGaiaHub(hubUrl, appPrivateKey, scopes);
    this.attrs.gaiaConfig = gaiaConfig;
    return gaiaConfig;
  }

  getSigningKey() {
    const { userGroups, signingKeys } = userGroupKeys();
    const id = userGroups[this._id];
    const privateKey = signingKeys[id];
    return {
      privateKey,
      id,
    };
  }
}
