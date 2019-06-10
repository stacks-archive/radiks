import { UserSession } from 'blockstack';

interface Config {
  apiServer: string,
  userSession: UserSession,
}

let config: Config = {
  apiServer: '',
  userSession: null,
};

export const configure = (newConfig: Config) => {
  config = {
    ...config,
    ...newConfig,
  };
};

/**
 * some info
 */
export const getConfig = (): Config => config;
