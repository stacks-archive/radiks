import uuid from 'uuid/v4';
import * as blockstack from 'blockstack';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
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
    this.id = attrs.id || uuid();
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
        const encrypted = await this.encrypted();
        const gaiaURL = await this.saveFile(encrypted);
        const doc = await sendNewGaiaUrl(gaiaURL);
        // console.log(doc);
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
    return new PouchDB(`${couchDBUrl}/${couchDBName}`);
  }

  async fetch({ decrypt = true } = {}) {
    const attrs = await this.db().get(this.id);
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

  encryptionPublicKey = () => getPublicKeyFromPrivate(this.encryptionPrivateKey())

  encryptionPrivateKey = () => {
    let privateKey;
    if (this.attrs.userGroupId) {
      const keys = userGroupKeys();
      privateKey = keys[this.attrs.userGroupId];
    } else {
      privateKey = blockstack.loadUserData().appPrivateKey;
    }
    return privateKey;
  }
}
