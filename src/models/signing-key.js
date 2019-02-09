import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { loadUserData } from 'blockstack/lib/auth/authApp';

import Model from '../model';

export default class SigningKey extends Model {
  static className = 'SigningKey';

  static schema = {
    publicKey: {
      type: String,
      decrypted: true,
    },
    privateKey: String,
    userGroupId: {
      type: String,
      decrypted: true,
    },
  }

  static defaults = {
    updatable: false,
  }

  static async create(attrs = {}) {
    const privateKey = makeECPrivateKey();
    const publicKey = getPublicKeyFromPrivate(privateKey);
    const signingKey = new this({
      ...attrs,
      publicKey,
      privateKey,
    });
    await signingKey.save();
    return signingKey;
  }

  encryptionPrivateKey = () => loadUserData().appPrivateKey
}
