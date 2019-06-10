import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';

import Model from '../model';
import GroupMembership from './group-membership';
import GroupInvitation from './group-invitation';
import SigningKey from './signing-key';
import {
  userGroupKeys, addUserGroupKey, loadUserData, requireUserSession,
} from '../helpers';
import { Schema, Attrs } from '../types/index';

interface Member {
  username: string,
  inviteId: string
}

interface UserGroupAttrs extends Attrs {
  name?: string | any,
  gaiaConfig: Record<string, any> | any,
  members: any[] | any,
}

const defaultMembers: Member[] = [];

export default class UserGroup extends Model {
  privateKey?: string;

  static schema: Schema = {
    name: String,
    gaiaConfig: Object,
    members: {
      type: Array,
    },
  }

  static defaults = {
    members: defaultMembers,
  }

  static async find(id: string) {
    const { userGroups, signingKeys } = GroupMembership.userGroupKeys();
    if (!userGroups || !userGroups[id]) {
      throw new Error(`UserGroup not found with id: '${id}'. Have you called \`GroupMembership.cacheKeys()\`?`);
    }
    const signingKey = userGroups[id];
    const privateKey = signingKeys[signingKey];
    const userGroup = new this({ _id: id });
    userGroup.privateKey = privateKey;
    await userGroup.fetch();
    return userGroup;
  }

  async create() {
    const signingKey = await SigningKey.create({ userGroupId: this._id });
    this.attrs.signingKeyId = signingKey._id;
    this.privateKey = signingKey.attrs.privateKey;
    addUserGroupKey(this);
    // await this.makeGaiaConfig();
    const { username } = loadUserData();
    const invitation = await this.makeGroupMembership(username);
    await invitation.activate();
    return this;
  }

  async makeGroupMembership(username: string): Promise<GroupInvitation> {
    let existingInviteId = null;
    this.attrs.members.forEach((member: Member) => {
      if (member.username === username) {
        existingInviteId = member.inviteId;
      }
    });
    if (existingInviteId) {
      const invitation = await GroupInvitation.findById(
        existingInviteId,
        { decrypt: false },
      );
      return invitation as GroupInvitation;
    }
    const invitation = await GroupInvitation.makeInvitation(username, this);
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

  async encryptionPublicKey() {
    return this.publicKey();
  }

  encryptionPrivateKey() {
    if (this.privateKey) {
      return this.privateKey;
    }
    const { signingKeys } = userGroupKeys();
    return signingKeys[this.attrs.signingKeyId];
  }

  // async makeGaiaConfig() {
  //   const userData = loadUserData();
  //   const { appPrivateKey, hubUrl } = userData;
  //   const scopes = [
  //     {
  //       scope: 'putFilePrefix',
  //       domain: `UserGroups/${this._id}/`,
  //     },
  //   ];
  //   const userSession = requireUserSession();
  //   const gaiaConfig = await userSession.connectToGaiaHub(hubUrl, appPrivateKey, scopes);
  //   this.attrs.gaiaConfig = gaiaConfig;
  //   return gaiaConfig;
  // }

  static modelName = () => 'UserGroup'

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
