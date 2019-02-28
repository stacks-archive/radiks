import uuid from 'uuid/v4';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { signECDSA } from 'blockstack/lib/encryption';
import EventEmitter from 'wolfy87-eventemitter';

import {
  encryptObject, decryptObject, userGroupKeys, requireUserSession,
} from './helpers';
import { sendNewGaiaUrl, find, FindQuery } from './api';
import Streamer from './streamer';

const EVENT_NAME = 'MODEL_STREAM_EVENT';

interface FetchOptions {
  decrypt?: boolean
}

interface Attrs {
  createdAt?: number,
  updatedAt?: number,
  _id?: string
  [key: string]: any,
}

interface SchemaAttribute {
  type: String | Object | Array<any> | Number | Boolean;
  decrypted?: boolean;
}

interface Schema {
  [key: string]: String | Object | Array<any> | Number | Boolean | SchemaAttribute;
}

export default class Model {
  public static schema: any;
  public static defaults: any = {};
  public static className?: string;
  public static emitter?: EventEmitter;
  schema: Schema;
  _id: string;
  attrs: Attrs;


  static fromSchema(schema: Schema) {
    this.schema = schema;
    return this;
  }

  static async fetchList(_selector: FindQuery = {}, { decrypt = true }: FetchOptions = {}) {
    const selector: FindQuery = {
      ..._selector,
      radiksType: this.modelName(),
    };
    const { results } = await find(selector);
    const Clazz = this;
    const modelDecryptions = results.map((doc) => {
      const model = new Clazz(doc);
      if (decrypt) {
        return model.decrypt();
      }
      return model;
    });
    const models = await Promise.all(modelDecryptions);
    return models;
  }

  static async findOne(_selector:FindQuery = {}, options: FetchOptions = { decrypt: true }) {
    const selector: FindQuery = {
      ..._selector,
      limit: 1,
    };
    const results = await this.fetchList(selector, options);
    return results[0];
  }

  /**
   * Fetch all models that are owned by the current user.
   * This only includes 'personally' owned models, and not those created
   * as part of a UserGroup
   *
   * @param {Object} _selector - A query to include when fetching models
   */
  static fetchOwnList(_selector: FindQuery = {}) {
    const { _id } = userGroupKeys().personal;
    const selector = {
      ..._selector,
      signingKeyId: _id,
    };
    return this.fetchList(selector);
  }

  static findById(_id: string, fetchOptions: Object) {
    const Clazz = this;
    const model = new Clazz({ _id });
    return model.fetch(fetchOptions);
  }

  constructor(attrs: any = {}) {
    const { schema, defaults } = <typeof Model> this.constructor;
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
    const userSession = requireUserSession();
    return userSession.putFile(this.blockstackPath(), JSON.stringify(encrypted), {
      encrypt: false,
    });
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
    await this.afterFetch();
    return this;
  }

  async decrypt() {
    this.attrs = await decryptObject(this.attrs, this);
    return this;
  }

  update(attrs: Attrs) {
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
    const contentToSign: Array<any> = [this._id];
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
      privateKey = requireUserSession().loadUserData().appPrivateKey;
    }
    return privateKey;
  }

  static modelName() {
    return this.className || this.name;
  }

  modelName() {
    const { modelName } = <typeof Model> this.constructor;
    return modelName();
  }

  isOwnedByUser() {
    const keys = userGroupKeys();
    if (this.attrs.signingKeyId === keys.personal._id) {
      return true;
    } if (this.attrs.userGroupId) {
      let isOwned = false;
      Object.keys(keys.userGroups).forEach((groupId) => {
        if (groupId === this.attrs.userGroupId) {
          isOwned = true;
        }
      });
      return isOwned;
    }
    return false;
  }

  static onStreamEvent = (_this, [event]) => {
    try {
      const { data } = event;
      const attrs = JSON.parse(data);
      if (attrs && attrs.radiksType === _this.modelName()) {
        const model = new _this(attrs);
        if (model.isOwnedByUser()) {
          model.decrypt().then(() => {
            _this.emitter.emit(EVENT_NAME, model);
          });
        } else {
          _this.emitter.emit(EVENT_NAME, model);
        }
      }
    } catch (error) {
      // console.error(error.message);
    }
  }

  static addStreamListener(callback) {
    if (!this.emitter) {
      this.emitter = new EventEmitter();
    }
    if (this.emitter.getListeners().length === 0) {
      Streamer.addListener((args: any) => {
        this.onStreamEvent(this, args);
      });
    }
    this.emitter.addListener(EVENT_NAME, callback);
  }

  static removeStreamListener(callback) {
    this.emitter.removeListener(EVENT_NAME, callback);
    if (this.emitter.getListeners().length === 0) {
      Streamer.removeListener(this.onStreamEvent);
    }
  }

  // @abstract
  beforeSave() { }

  // @abstract
  afterFetch() { }
}
