import { loadUserData } from 'blockstack/lib/auth/authApp';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';

import Model from '../model';
import SigningKey from './signing-key';
import GroupMembership from './group-membership';
import { addPersonalSigningKey } from '../helpers';

const decrypted = true;

export default class BlockstackUser extends Model {
  static className = 'BlockstackUser';

  static schema = {
    username: {
      type: String,
      decrypted,
    },
    publicKey: {
      type: String,
      decrypted,
    },
    profile: {
      type: String,
      decrypted,
    },
    signingKeyId: String,
  }

  static currentUser() {
    if (typeof window === 'undefined') {
      return null;
    }

    const userData = loadUserData();
    if (!userData) {
      return null;
    }

    const { username, profile, appPrivateKey } = userData;
    const publicKey = getPublicKeyFromPrivate(appPrivateKey);
    const Clazz = this;
    const user = new Clazz({
      _id: username,
      username,
      publicKey,
      profile,
    });

    return user;
  }

  async createSigningKey() {
    const key = await SigningKey.create();
    this.attrs.signingKeyId = key._id;
    return key;
  }

  static createWithCurrentUser() {
    return new Promise((resolve, reject) => {
      const resolveUser = (user, _resolve) => user.save().then(() => {
        GroupMembership.cacheKeys().then(() => {
          _resolve(user);
        });
      });
      try {
        const user = this.currentUser();
        user.fetch().catch(() => {
          // console.error('caught error', e);
        }).finally(() => {
          // console.log(user.attrs);
          if (!user.attrs.signingKeyId) {
            user.createSigningKey().then((key) => {
              addPersonalSigningKey(key);
              resolveUser(user, resolve);
            });
          } else {
            SigningKey.findById(user.attrs.signingKeyId).then((key) => {
              addPersonalSigningKey(key);
              resolveUser(user, resolve);
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
