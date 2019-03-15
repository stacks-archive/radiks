import { signECDSA } from 'blockstack/lib/encryption';

import { getConfig } from './config';
import { saveCentral, fetchCentral } from './api';

class Central {
  static save(key: string, value: Record<string, any>) {
    const { username, signature } = this.makeSignature(key);
    return saveCentral({
      username,
      key,
      value,
      signature,
    });
  }

  static get(key: string) {
    const { username, signature } = this.makeSignature(key);

    return fetchCentral(key, username, signature);
  }

  static makeSignature(key: string) {
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
