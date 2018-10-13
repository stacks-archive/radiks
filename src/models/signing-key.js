import { makeECPrivateKey, getPublicKeyFromPrivate } from 'blockstack/lib/keys';

import Model from '../model';

export default class SigningKey extends Model {
  static schema = {
    publicKey: {
      type: String,
      decrypted: true,
    },
    privateKey: String,
  }

  static defaults = {
    updatable: false,
  }

  static async create() {
    const privateKey = makeECPrivateKey();
    const publicKey = getPublicKeyFromPrivate(privateKey);
    const signingKey = new this({
      publicKey,
      privateKey,
    });
    return signingKey.save();
  }
}
