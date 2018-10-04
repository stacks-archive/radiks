import { encryptECIES, decryptECIES } from 'blockstack/lib/encryption';

const valueToString = (value, clazz) => {
  if (clazz === Boolean) {
    return value ? 'true' : 'false';
  } if (clazz === Number) {
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

export const decryptObject = async (encrypted, model) => {
  const privateKey = await model.encryptionPrivateKey();
  const decrypted = Object.assign({}, encrypted);
  const { schema } = model;
  Object.keys(encrypted).forEach((key) => {
    const value = encrypted[key];
    const clazz = schema[key];
    if (clazz && !clazz.decrypted) {
      try {
        const decryptedValue = decryptECIES(privateKey, value);
        decrypted[key] = stringToValue(decryptedValue, clazz.type || clazz);
      } catch (error) {
        decrypted[key] = value;
      }
    }
  });
  return decrypted;
};

export const encryptObject = async (model) => {
  const publicKey = await model.encryptionPublicKey();
  const object = model.attrs;
  const encrypted = Object.assign({}, object, { id: model.id });
  Object.keys(model.schema).forEach((key) => {
    const clazz = model.schema[key];
    const { decrypted } = clazz;
    const value = object[key];
    if (typeof (value) !== 'undefined') {
      const stringValue = valueToString(value, clazz.type || clazz);
      encrypted[key] = decrypted ? value : encryptECIES(publicKey, stringValue);
    }
  });
  return encrypted;
};
