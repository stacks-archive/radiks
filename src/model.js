import uuid from 'uuid/v4';
import * as blockstack from 'blockstack';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { signECDSA } from 'blockstack/lib/encryption';

import { encryptObject, decryptObject, userGroupKeys } from './helpers';
import { sendNewGaiaUrl, find } from './api';

export default class Model {
  static apiServer = null;

  static fromSchema(schema) {
    this.schema = schema;
    return this;
  }

  static defaults = {}

  static async fetchList(_selector = {}, { decrypt = true } = {}) {
    const selector = {
      ..._selector,
      radiksType: this.modelName(),
    };
    const { results } = await find(selector);
    const Clazz = this;
    const modelDecryptions = results.map((doc) => {
      const model = new Clazz(doc);
      if (decrypt) {
        model.decrypt();
      }
      return model;
    });
    const models = await Promise.all(modelDecryptions);
    return models;
  }

  static async findOne(selector = {}, options = { decrypt: true }) {
    const opts = {
      ...options,
      limit: 1,
    };
    const results = await this.fetchList(selector, opts);
    return results[0];
  }

  /**
   * Fetch all models that are owned by the current user.
   * This only includes 'personally' owned models, and not those created
   * as part of a UserGroup
   *
   * @param {Object} _selector - A query to include when fetching models
   */
  static fetchOwnList(_selector = {}) {
    const { _id } = userGroupKeys().personal;
    const selector = {
      ..._selector,
      signingKeyId: _id,
    };
    return this.fetchList(selector);
  }

  static findById(_id, fetchOptions) {
    const Clazz = this;
    const model = new Clazz({ _id });
    return model.fetch(fetchOptions);
  }

  constructor(attrs = {}) {
    const { schema, defaults } = this.constructor;
    const name = this.modelName();
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
        if (this.beforeSave) {
          await this.beforeSave();
        }
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
    const path = `${this.modelName()}/${this._id}`;
    return path;
  }

  async fetch({ decrypt = true } = {}) {
    const query = {
      _id: this._id,
    };
    const { results } = await find(query);
    const [attrs] = results;
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

  encryptionPublicKey() {
    return getPublicKeyFromPrivate(this.encryptionPrivateKey());
  }

  encryptionPrivateKey() {
    let privateKey;
    if (this.attrs.userGroupId) {
      const { userGroups, signingKeys } = userGroupKeys();
      privateKey = signingKeys[userGroups[this.attrs.userGroupId]];
    } else {
      privateKey = blockstack.loadUserData().appPrivateKey;
    }
    return privateKey;
  }

  static modelName() {
    return this.className || this.name;
  }

  modelName() {
    return this.constructor.modelName();
  }
}
