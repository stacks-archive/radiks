import uuid from 'uuid/v4';
import * as blockstack from 'blockstack';
import merge from 'lodash/merge';
import PouchDB from 'pouchdb';
// import PouchDebug from 'pouchdb-debug';
import PouchFind from 'pouchdb-find';

import { encryptObject, decryptObject, authOptions } from './helpers';

// PouchDB.plugin(PouchDebug);
PouchDB.plugin(PouchFind);

export default class Model {
  static apiServer = null;

  static fromSchema(schema) {
    this.schema = schema;
    return this;
  }

  static defaults = {}

  static async fetchList(selector, options = {}) {
    selector.radiksType = this.name;
    const db = this.db();
    const { docs } = await db.find({ selector, ...options });
    const clazz = this;
    const models = docs.map((doc) => {
      const model = new clazz(doc);
      model.decrypt();
      return model;
    });
    return models;
  }

  constructor(attrs = {}) {
    const { schema, defaults, name } = this.constructor;
    this.schema = schema;
    this.id = attrs.id || uuid();
    const { username } = blockstack.loadUserData();
    this.attrs = merge({}, defaults, attrs, { createdBy: username, radiksType: name });
  }

  hello() {
    console.log(this.schema);
  }

  async fetchSchema() {
    const { name } = this.schema;
    const url = `${this.constructor.apiServer}/radiks/models/${name}/schema`;
    // console.log(url);
    const request = await fetch(url);
    const data = await request.json();
    return data;
  }

  save() {
    const encrypted = this.encrypted();
    return Promise.all([this.saveFile(encrypted), this.saveItem(), this.saveToDB(encrypted)]);
  }

  encrypted() {
    return encryptObject(this);
  }

  saveFile(encrypted) {
    // console.log(this);
    // const data = encryptObject(this);
    // console.log(data);
    return blockstack.putFile(this.blockstackPath(), JSON.stringify(encrypted), { encrypt: false });
  }

  blockstackPath() {
    const path = `${this.constructor.name}/${this.id}`;
    return path;
  }

  saveItem() {
    return new Promise(async (resolve, reject) => {
      const itemsPath = 'items';
      try {
        let items = await blockstack.getFile(itemsPath, { decrypt: false });
        const filePath = this.blockstackPath();
        items += `\n${filePath}`;
        resolve(await blockstack.putFile(itemsPath, items, { encrypt: false }));
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveToDB(encrypted) {
    const filePath = this.blockstackPath();
    const attributes = merge({}, encrypted, { filePath });
    const db = this.db();
    attributes._id = attributes.id;
    try {
      const result = await db.put(attributes);
      this.attrs._rev = result.rev;
    } catch (error) {
      console.error('Error when saving to PouchDB', error);
      throw (error);
    }
  }

  db() {
    return this.constructor.db();
  }

  static db() {
    return new PouchDB('http://127.0.0.1:5984/kanstack', {
      auth: {
        ...authOptions(),
      },
    });
  }

  async fetch() {
    const attrs = await this.db().get(this.id);
    this.attrs = merge(attrs, this.attrs);
    this.decrypt();
    if (this.afterFetch) await this.afterFetch();
    return this;
  }

  decrypt() {
    this.attrs = decryptObject(this.attrs, this.constructor);
  }

  update(attrs) {
    this.attrs = {
      ...this.attrs,
      ...attrs,
    };
  }
}
