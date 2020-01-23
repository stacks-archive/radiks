import { encrypt, decrypt } from 'aes256';
import cryptoRandomString from 'crypto-random-string';
import Model from '../model';
import GroupMembership from './group-membership';
import UserGroup from './user-group';
import { userGroupKeys, loadUserData } from '../helpers';
import { Schema } from '../types/index';
import { GroupInvitation } from '..';
export default class GenericGroupInvitation extends Model {
  static className = 'GenericGroupInvitation';
  secretKey: string;

  static schema: Schema = {
    // invitationDetails contains JSON object (encrypted
    // with secretKey) with the following properties:
    // - userGroupId
    // - signingKeyPrivateKey
    // - signingKeyId
    invitationDetails: {
      type: String,
      decrypted: true,
    },
  };

  static defaults = {
    updatable: false,
  };

  static async makeGenericInvitation(userGroup: UserGroup) {
    const invitationDetails = JSON.stringify({
      userGroupId: userGroup._id,
      signingKeyPrivateKey: userGroup.privateKey,
      signingKeyId: userGroup.attrs.signingKeyId,
    });
    const secretKey = cryptoRandomString({ length: 32, type: 'url-safe' });
    const invitationDetailsEncrypted = encrypt(secretKey, invitationDetails);
    const invitation = new this({
      invitationDetails: invitationDetailsEncrypted,
    });
    invitation.secretKey = secretKey;
    await invitation.save();
    return invitation;
  }

  async activate(secretKey: string) {
    const invitationDetailsDecrypted = decrypt(
      secretKey,
      this.attrs.invitationDetails
    );
    const { userGroupId, signingKeyPrivateKey, signingKeyId } = JSON.parse(
      invitationDetailsDecrypted
    );
    const { userGroups } = userGroupKeys();
    const groupId: string = userGroupId as string;
    if (userGroups[groupId]) {
      return true;
    }
    const username = loadUserData().username;
    const groupMembership = new GroupMembership({
      userGroupId,
      username,
      signingKeyPrivateKey,
      signingKeyId,
    });
    await groupMembership.save();
    await GroupMembership.cacheGroupKey(groupMembership);

    const encryptedUserGroup = (await UserGroup.findById(groupId, {
      decrypt: false,
    })) as UserGroup;
    encryptedUserGroup.privateKey = signingKeyPrivateKey;
    const userGroup = await encryptedUserGroup.decrypt();
    userGroup.attrs.members.push({
      username,
    });
    await userGroup.save();
    return groupMembership;
  }
}
