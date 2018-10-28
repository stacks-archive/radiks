import uuid from 'uuid/v4';
import * as blockstack from 'blockstack';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { signECDSA } from 'blockstack/lib/encryption';
// import { getConfig } from './config';

import { encryptObject, decryptObject, userGroupKeys } from './helpers';
import { sendNewGaiaUrl, find } from './api';
// import { GroupMembership } from './index';

export default class Model {
  static apiServer = null;

  static fromSchema(schema) {
    this.schema = schema;
    return this;
  }

  static defaults = {}

  static async fetchList(_selector, options = {}, { decrypt = true } = {}) {
    const selector = {
      ..._selector,
      radiksType: this.name,
    };
    // const db = this.db();
    // const { docs } = await db.find({ selector, ...options });
    const docs = await find(selector);
    const Clazz = this;
    const modelDecryptions = docs.map((doc) => {
      const model = new Clazz(doc);
      if (decrypt) {
        model.decrypt();
      }
      return model;
    });
    const models = await Promise.all(modelDecryptions);
    return models;
  }

  static findById(_id, fetchOptions) {
    const Clazz = this;
    const model = new Clazz({ _id });
    return model.fetch(fetchOptions);
  }

  constructor(attrs = {}) {
    const { schema, defaults, name } = this.constructor;
    this.schema = schema;
    this._id = attrs._id || uuid().replace('-', '');
    this.attrs = {
      ...defaults,
      ...attrs,
      radiksType: name,
    };
  }

  async save() {
    return new Promise(async (resolve, reject) => {
      try {
        const now = new Date().getTime();
        this.attrs.createdAt = this.attrs.createdAt || now;
        this.attrs.updatedAt = now;
        await this.sign();
        const encrypted = await this.encrypted();
        const gaiaURL = await this.saveFile(encrypted);
        await sendNewGaiaUrl(gaiaURL);
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  encrypted() {
    return encryptObject(this);
  }

  saveFile(encrypted) {
    return blockstack.putFile(this.blockstackPath(), JSON.stringify(encrypted), { encrypt: false });
  }

  blockstackPath() {
    const path = `${this.constructor.name}/${this._id}`;
    return path;
  }

  db() {
    return this.constructor.db();
  }

  // static db() {
  //   const { couchDBName, couchDBUrl } = getConfig();
  //   let url = '';
  //   if (couchDBUrl) {
  //     url += `${couchDBUrl}/`;
  //   }
  //   url += couchDBName;
  //   return new PouchDB(url);
  // }

  async fetch({ decrypt = true } = {}) {
    const query = {
      _id: this._id,
    };
    const [attrs] = await find(query);
    this.attrs = {
      ...this.attrs,
      ...attrs,
    };
    if (decrypt) {
      await this.decrypt();
    }
    if (this.afterFetch) await this.afterFetch();
    return this;
  }

  async decrypt() {
    this.attrs = await decryptObject(this.attrs, this);
    return this;
  }

  update(attrs) {
    this.attrs = {
      ...this.attrs,
      ...attrs,
    };
  }

  async sign() {
    if (this.attrs.updatable === false) {
      return true;
    }
    const signingKey = this.getSigningKey();
    this.attrs.signingKeyId = this.attrs.signingKeyId || signingKey._id;
    const { privateKey } = signingKey;
    const contentToSign = [this._id];
    if (this.attrs.updatedAt) {
      contentToSign.push(this.attrs.updatedAt);
    }
    // if (!privateKey) {
    //   console.log(this.attrs.radiksType, this.attrs.userGroupId);
    //   console.log(userGroupKeys());
    // }
    const { signature } = signECDSA(privateKey, contentToSign.join('-'));
    this.attrs.radiksSignature = signature;
    return this;
  }

  getSigningKey() {
    if (this.attrs.userGroupId) {
      const { userGroups, signingKeys } = userGroupKeys();

      const _id = userGroups[this.attrs.userGroupId];
      const privateKey = signingKeys[_id];
      return {
        _id,
        privateKey,
      };
    }
    return userGroupKeys().personal;
  }

  encryptionPublicKey = () => getPublicKeyFromPrivate(this.encryptionPrivateKey())

  encryptionPrivateKey = () => {
    let privateKey;
    if (this.attrs.userGroupId) {
      const { userGroups, signingKeys } = userGroupKeys();
      privateKey = signingKeys[userGroups[this.attrs.userGroupId]];
    } else {
      privateKey = blockstack.loadUserData().appPrivateKey;
    }
    return privateKey;
  }
}
