"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signUp = exports.authOptions = exports.signMessage = exports.encryptObject = exports.decryptObject = void 0;

var blockstack = _interopRequireWildcard(require("blockstack"));

var _encryption = require("blockstack/lib/encryption");

var _api = require("./api");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const valueToString = (value, clazz) => {
  if (clazz === Boolean) {
    return value ? 'true' : 'false';
  }

  if (clazz === Number) {
    return String(value);
  }

  return value;
};

const stringToValue = (value, clazz) => {
  if (clazz === Boolean) {
    return value === 'true';
  }

  if (clazz === Number) {
    return parseFloat(value);
  }

  return value;
};

const decryptObject = (encrypted, Model) => {
  const decrypted = Object.assign({}, encrypted);
  const {
    schema
  } = Model;
  Object.keys(encrypted).forEach(key => {
    const value = encrypted[key];
    const clazz = schema[key];

    if (clazz && !clazz.decrypted) {
      try {
        decrypted[key] = stringToValue(blockstack.decryptContent(value), clazz.type || clazz);
      } catch (error) {
        decrypted[key] = value;
      }
    }
  });
  return decrypted;
};

exports.decryptObject = decryptObject;

const encryptObject = model => {
  const object = model.attrs;
  const encrypted = Object.assign({}, object, {
    id: model.id
  });
  Object.keys(model.schema).forEach(key => {
    const clazz = model.schema[key];
    const {
      decrypted
    } = clazz;
    const value = object[key];

    if (typeof value !== 'undefined') {
      encrypted[key] = decrypted ? value : blockstack.encryptContent(valueToString(value, clazz.type || clazz));
    }
  });
  return encrypted;
};

exports.encryptObject = encryptObject;

const signMessage = message => {
  const {
    appPrivateKey
  } = blockstack.loadUserData();
  return (0, _encryption.signECDSA)(appPrivateKey, message);
};

exports.signMessage = signMessage;

const authOptions = () => {
  const {
    appPrivateKey,
    username
  } = blockstack.loadUserData();
  const {
    signature
  } = (0, _encryption.signECDSA)(appPrivateKey, 'RADIKS_LOGIN');
  return {
    username,
    password: signature
  };
};

exports.authOptions = authOptions;

const signUp = userData => {
  return Promise.resolve().then(function () {
    const {
      appPrivateKey,
      username
    } = userData;
    const signed = (0, _encryption.signECDSA)(appPrivateKey, 'RADIKS_LOGIN');
    return (0, _api.sendLoginSignedMessage)(signed, username);
  }).then(function () {});
};

exports.signUp = signUp;