import uuid from 'uuid/v4';
import * as blockstack from 'blockstack';
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import { getConfig } from './config';

import { encryptObject, decryptObject } from './helpers';

PouchDB.plugin(PouchFind);

export default class Model {
  static apiServer = null;

  static fromSchema(schema) {
    this.schema = schema;
    return this;
  }

  static defaults = {}

  static async fetchList(_selector, options = {}) {
    const selector = {
      ..._selector,
      radiksType: this.name,
    };
    const db = this.db();
    const { docs } = await db.find({ selector, ...options });
    const Clazz = this;
    const models = docs.map((doc) => {
      const model = new Clazz(doc);
      model.decrypt();
      return model;
    });
    return models;
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

  static hello() {
    console.log(this.name);
  }

  async fetchSchema() {
    const { name } = this.schema;
    const url = `${this.constructor.apiServer}/radiks/models/${name}/schema`;
    // console.log(url);
    const request = await fetch(url);
    const data = await request.json();
    return data;
  }

  async save() {
    return new Promise(async (resolve, reject) => {
      try {
        this.attrs.createdAt = this.attrs.createdAt || new Date().getTime();
        this.attrs.updatedAt = new Date().getTime();
        const encrypted = this.encrypted();
        const gaiaURL = await this.saveFile(encrypted);
        await this.saveToAPI(gaiaURL);
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

  saveToAPI = async (gaiaURL) => {
    const { apiServer } = getConfig();
    const url = `${apiServer}/radiks/models/crawl`;
    // console.log(url, gaiaURL);
    const data = { gaiaURL };
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
    const { success } = await response.json();
    return success;
  }

  db() {
    return this.constructor.db();
  }

  static db() {
    const { couchDBName, couchDBUrl } = getConfig();
    return new PouchDB(`${couchDBUrl}/${couchDBName}`);
  }

  async fetch() {
    const attrs = await this.db().get(this.id);
    this.attrs = {
      ...this.attrs,
      ...attrs,
    };
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
