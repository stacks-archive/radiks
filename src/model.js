import uuid from 'uuid/v4';
import * as blockstack from 'blockstack';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { signECDSA } from 'blockstack/lib/encryption';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import { getConfig } from './config';

import { encryptObject, decryptObject, userGroupKeys } from './helpers';
import { sendNewGaiaUrl } from './api';
// import { GroupMembership } from './index';

PouchDB.plugin(PouchFind);

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
    const db = this.db();
    const { docs } = await db.find({ selector, ...options });
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

  static findById(id, fetchOptions) {
    const Clazz = this;
    const model = new Clazz({ id });
    return model.fetch(fetchOptions);
  }

  constructor(attrs = {}) {
    const { schema, defaults, name } = this.constructor;
    this.schema = schema;
    this.id = attrs.id || uuid().replace('-', '');
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
        const doc = await sendNewGaiaUrl(gaiaURL);
        this.attrs._rev = doc.rev;
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
    const path = `${this.constructor.name}/${this.id}`;
    return path;
  }

  db() {
    return this.constructor.db();
  }

  static db() {
    const { couchDBName, couchDBUrl } = getConfig();
    let url = '';
    if (couchDBUrl) {
      url += `${couchDBUrl}/`;
    }
    url += couchDBName;
    return new PouchDB(url);
  }

  async fetch({ decrypt = true } = {}) {
    const attrs = await this.db().get(this.id);
    // console.log('db attrs', attrs.signingKeyId);
    this.attrs = {
      ...this.attrs,
      ...attrs,
    };
    // console.log('fetching', this.constructor.name, decrypt);
    if (decrypt) {
      await this.decrypt();
    }
    // console.log('after decrypt', this.attrs.signingKeyId);
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
    // const oldSigningKeyId = this.attrs.signingKeyId || signingKey.id;
    this.attrs.signingKeyId = signingKey.id;
    const { privateKey } = signingKey;
    // // if a user group rotates keys, we need to sign with the old key
    // if (oldSigningKeyId !== signingKey.id) {
    //   privateKey = userGroupKeys().signingKeys[oldSigningKeyId];
    // }
    const contentToSign = [this.id];
    if (this.attrs._rev) {
      contentToSign.push(this.attrs._rev);
    }
    const { signature } = signECDSA(privateKey, contentToSign.join('-'));
    this.attrs.radiksSignature = signature;
    return this;
  }

  getSigningKey() {
    if (this.attrs.userGroupId) {
      const { userGroups, signingKeys } = userGroupKeys();

      const id = userGroups[this.attrs.userGroupId];
      const privateKey = signingKeys[id];
      return {
        id,
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
