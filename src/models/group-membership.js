import { encryptECIES } from 'blockstack/lib/encryption';

import Model from '../model';
import User from './user';
import UserGroup from './user-group';

export default class GroupMembership extends Model {
  static schema = {
    userGroupId: String,
    username: {
      type: String,
      decrypted: true,
    },
    groupPrivateKey: Object,
  }

  async encryptionPublicKey() {
    const user = new User({ id: this.attrs.username });
    await user.fetch();
    const { publicKey } = user.attrs;
    return publicKey;
  }

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
