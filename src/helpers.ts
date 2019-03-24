import { encryptECIES, decryptECIES } from 'blockstack/lib/encryption';
import { getConfig } from './config';
import Model from './model';
import { SchemaAttribute } from './types';

export const GROUP_MEMBERSHIPS_STORAGE_KEY = 'GROUP_MEMBERSHIPS_STORAGE_KEY';

const valueToString = (value: any, clazz: any) => {
  if (clazz === Boolean) {
    return value ? 'true' : 'false';
  } if (clazz === Number) {
    return String(value);
  } if (clazz === Array || clazz === Object) {
    return JSON.stringify(value);
  }
  return value;
};

const stringToValue = (value: string, clazz: any) => {
  if (clazz === Boolean) {
    return value === 'true';
  } if (clazz === Number) {
    return parseFloat(value);
  } if (clazz === Array || clazz === Object) {
    return JSON.parse(value);
  }
  return value;
};

export const decryptObject = async (encrypted: any, model: Model) => {
  const privateKey = await model.encryptionPrivateKey();
  const decrypted = {
    ...encrypted,
  };
  const { schema } = model;
  Object.keys(encrypted).forEach((key) => {
    const value = encrypted[key];
    const schemaValue = schema[key];
    let clazz = schemaValue;
    const schemaAttribute = schema[key] as SchemaAttribute;
    if (schemaAttribute && schemaAttribute.type) {
      clazz = schemaAttribute.type;
    }
    if (clazz && schemaAttribute && !schemaAttribute.decrypted) {
      try {
        const decryptedValue = decryptECIES(privateKey, value) as string;
        decrypted[key] = stringToValue(decryptedValue, clazz);
      } catch (error) {
        console.debug(`Decryption error for key: '${key}': ${error.message}`); // eslint-disable-line
        decrypted[key] = value;
      }
    }
  });
  return decrypted;
};

export const encryptObject = async (model: Model) => {
  const publicKey = await model.encryptionPublicKey();
  const object = model.attrs;
  const encrypted = {
    ...object,
    _id: model._id,
  };
  Object.keys(model.schema).forEach((key) => {
    const schemaValue = model.schema[key];
    const schemaAttribute = model.schema[key] as SchemaAttribute;
    const value = object[key];
    let clazz = schemaValue;
    if (typeof value === 'undefined') return;
    if (schemaAttribute.type) {
      clazz = schemaAttribute.type;
    }
    if (schemaAttribute.decrypted) {
      encrypted[key] = value;
      return;
    }
    const stringValue = valueToString(value, clazz);
    encrypted[key] = encryptECIES(publicKey, stringValue);
  });
  return encrypted;
};

export const clearStorage = () => {
  localStorage.removeItem(GROUP_MEMBERSHIPS_STORAGE_KEY);
};

export const userGroupKeys = () => {
  const keysString = localStorage.getItem(GROUP_MEMBERSHIPS_STORAGE_KEY);
  let keys = keysString ? JSON.parse(keysString) : {};
  keys = {
    userGroups: {},
    signingKeys: {},
    personal: {},
    ...keys,
  };
  return keys;
};

export const addPersonalSigningKey = (signingKey) => {
  const keys = userGroupKeys();
  keys.personal = {
    _id: signingKey._id,
    ...signingKey.attrs,
  };
  localStorage.setItem(GROUP_MEMBERSHIPS_STORAGE_KEY, JSON.stringify(keys));
};

export const addUserGroupKey = (userGroup) => {
  const keys = userGroupKeys();
  keys.userGroups[userGroup._id] = userGroup.attrs.signingKeyId;
  keys.signingKeys[userGroup.attrs.signingKeyId] = userGroup.privateKey;
  localStorage.setItem(GROUP_MEMBERSHIPS_STORAGE_KEY, JSON.stringify(keys));
};

export const requireUserSession = () => {
  const { userSession } = getConfig();
  if (!userSession) {
    // TODO: link to docs
    throw new Error('You have not properly configured your UserSession.');
  }
  return userSession;
};

export const loadUserData = () => {
  const { userSession } = getConfig();
  if (userSession) {
    return userSession.loadUserData();
  }
  return null;
};
