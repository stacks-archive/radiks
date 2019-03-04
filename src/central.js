import { signECDSA } from 'blockstack/lib/encryption/ec';

import { getConfig } from './config';
import { saveCentral, fetchCentral } from './api';

class Central {
  static save(key, value) {
    const { username, signature } = this.makeSignature(key);
    return saveCentral({
      username,
      key,
      value,
      signature,
    });
  }

  static get(key) {
    const { username, signature } = this.makeSignature(key);

    return fetchCentral(key, username, signature);
  }

  static makeSignature(key) {
    const { userSession } = getConfig();
    const { appPrivateKey, username } = userSession.loadUserData();
    const message = `${username}-${key}`;

    const { signature } = signECDSA(appPrivateKey, message);

    return {
      username, signature,
    };
  }
}

export default Central;
