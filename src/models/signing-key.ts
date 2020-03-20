import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';

import Model from '../model';
import { loadUserData } from '../helpers';
import { Attrs } from '../types/index';

interface SigningKeyAttrs extends Attrs {
  publicKey?: string,
  privateKey?: string | any,
  userGroupId?: string,
}

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
    const signingKey = new SigningKey({
      ...attrs,
      publicKey,
      privateKey,
    });
    await signingKey.save.apply(signingKey);
    return signingKey;
  }

  encryptionPrivateKey = () => loadUserData().appPrivateKey
}
