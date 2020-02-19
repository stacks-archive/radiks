import uuid from 'uuid/v4';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import { signECDSA } from 'blockstack/lib/encryption';
import EventEmitter from 'wolfy87-eventemitter';

import {
  encryptObject,
  decryptObject,
  userGroupKeys,
  requireUserSession,
} from './helpers';
import {
  sendNewGaiaUrl, find, count, FindQuery, destroyModel,
} from './api';
import Streamer from './streamer';
import { Schema, Attrs } from './types/index';

const EVENT_NAME = 'MODEL_STREAM_EVENT';

interface FetchOptions {
  decrypt?: boolean;
}

interface Event {
  data: string;
}

export default class Model {
  public static schema: Schema;
  public static defaults: any = {};
  public static className?: string;
  public static emitter?: EventEmitter;
  public static validateUsername = false;
  schema: Schema;
  _id: string;
  attrs: Attrs;

  static fromSchema(schema: Schema) {
    this.schema = schema;
    return this;
  }

  static async fetchList<T extends Model>(
    _selector: FindQuery = {},
    { decrypt = true }: FetchOptions = {},
  ) {
    const selector: FindQuery = {
      ..._selector,
      radiksType: this.modelName(),
    };
    const { results } = await find(selector);
    const Clazz = this;
    const modelDecryptions: Promise<T>[] = results.map((doc: any) => {
      const model = new Clazz(doc);
      if (decrypt) {
        return model.decrypt();
      }
      return Promise.resolve(model);
    });
    const models: T[] = await Promise.all(modelDecryptions);
    return models;
  }

  static async findOne<T extends Model>(
    _selector: FindQuery = {},
    options: FetchOptions = { decrypt: true },
  ) {
    const selector: FindQuery = {
      ..._selector,
      limit: 1,
    };
    const results: T[] = await this.fetchList(selector, options);
    return results[0];
  }

  static async findById<T extends Model>(
    _id: string,
    fetchOptions?: Record<string, any>,
  ) {
    const Clazz = this;
    const model: Model = new Clazz({ _id });
    return model.fetch(fetchOptions);
  }

  static async count(_selector: FindQuery = {}): Promise<number> {
    const selector: FindQuery = {
      ..._selector,
      radiksType: this.modelName(),
    };
    const data = await count(selector);
    return data.total;
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

  constructor(attrs: Attrs = {}) {
    const { schema, defaults } = this.constructor as typeof Model;
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
        await this.setUsername();
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

  saveFile(encrypted: Record<string, any>) {
    const userSession = requireUserSession();
    return userSession.putFile(
      this.blockstackPath(),
      JSON.stringify(encrypted),
      {
        encrypt: false,
      },
    );
  }

  deleteFile() {
    const userSession = requireUserSession();
    return userSession.deleteFile(this.blockstackPath());
  }

  blockstackPath() {
    const path = `${this.modelName()}/${this._id}`;
    return path;
  }

  setUsername() {
    const { validateUsername } = this.constructor as typeof Model;
    if (validateUsername) {
      const userSession = requireUserSession();
      const { username, gaiaHubConfig } = userSession.loadUserData();
      this.attrs.username = username;
      // eslint-disable-next-line @typescript-eslint/camelcase
      const { url_prefix, address } = gaiaHubConfig;
      // eslint-disable-next-line @typescript-eslint/camelcase
      this.attrs.gaiaURL = `${url_prefix}${address}/${this.blockstackPath()}`;
    }
  }

  async fetch({ decrypt = true } = {}): Promise<this | undefined> {
    const query = {
      _id: this._id,
    };
    const { results } = await find(query);
    const [attrs] = results;
    // Object not found on the server so we return undefined
    if (!attrs) {
      return undefined;
    }
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
    const contentToSign: (string | number)[] = [this._id];
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

  async encryptionPublicKey() {
    return getPublicKeyFromPrivate(this.encryptionPrivateKey());
  }

  encryptionPrivateKey() {
    let privateKey: string;
    if (this.attrs.userGroupId) {
      const { userGroups, signingKeys } = userGroupKeys();
      privateKey = signingKeys[userGroups[this.attrs.userGroupId]];
    } else {
      privateKey = requireUserSession().loadUserData().appPrivateKey;
    }
    return privateKey;
  }

  static modelName(): string {
    return this.className || this.name;
  }

  modelName(): string {
    const { modelName } = this.constructor as typeof Model;
    return modelName.apply(this.constructor);
  }

  isOwnedByUser() {
    const keys = userGroupKeys();
    if (this.attrs.signingKeyId === keys.personal._id) {
      return true;
    }
    if (this.attrs.userGroupId) {
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
  };

  static addStreamListener(callback: () => void) {
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

  static removeStreamListener(callback: () => void) {
    this.emitter.removeListener(EVENT_NAME, callback);
    if (this.emitter.getListeners().length === 0) {
      Streamer.removeListener(this.onStreamEvent);
    }
  }

  async destroy(): Promise<boolean> {
    await this.sign();
    await this.deleteFile();
    return destroyModel(this);
  }

  // @abstract
  beforeSave() {}

  // @abstract
  afterFetch() {}
}
