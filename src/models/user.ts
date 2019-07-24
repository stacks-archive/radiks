import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { signECDSA } from 'blockstack/lib/encryption';

import Model from '../model';
import SigningKey from './signing-key';
import GroupMembership from './group-membership';
import { addPersonalSigningKey, loadUserData } from '../helpers';
import { Schema } from '../types/index';

const decrypted = true;

export default class BlockstackUser extends Model {
  static className = 'BlockstackUser';

  static schema: Schema = {
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
    personalSigningKeyId: String,
  };

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
    this.attrs.personalSigningKeyId = key._id;
    return key;
  }

  static createWithCurrentUser() {
    return new Promise((resolve, reject) => {
      const resolveUser = (
        user: BlockstackUser,
        _resolve: (value?: {} | PromiseLike<{}>) => void,
      ) => {
        user.save().then(() => {
          GroupMembership.cacheKeys().then(() => {
            _resolve(user);
          });
        });
      };
      try {
        const user = this.currentUser();
        user
          .fetch()
          .catch(() => {
            // console.error('caught error', e);
          })
          .finally(() => {
            // console.log(user.attrs);
            const userData = loadUserData();
            const { username, profile, appPrivateKey } = userData;
            const publicKey = getPublicKeyFromPrivate(appPrivateKey);
            user.update({
              username,
              profile,
              publicKey,
            });
            if (!user.attrs.personalSigningKeyId) {
              user.createSigningKey().then((key) => {
                addPersonalSigningKey(key);
                resolveUser(user, resolve);
              });
            } else {
              SigningKey.findById(user.attrs.personalSigningKeyId).then(
                (key: SigningKey) => {
                  addPersonalSigningKey(key);
                  resolveUser(user, resolve);
                },
              );
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  async sign() {
    this.attrs.signingKeyId = 'personal';
    const { appPrivateKey } = loadUserData();
    const contentToSign: (string | number)[] = [this._id];
    if (this.attrs.updatedAt) {
      contentToSign.push(this.attrs.updatedAt);
    }
    const { signature } = signECDSA(appPrivateKey, contentToSign.join('-'));
    this.attrs.radiksSignature = signature;
    return this;
  }
}
