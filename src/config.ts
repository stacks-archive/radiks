interface UserSession {
  loadUserData: () => {
    appPrivateKey: string,
    profile: Object,
    username: string
  },
}

interface Config {
  apiServer: string,
  userSession: UserSession,
}

let config: Config = {
  apiServer: '',
  userSession: null,
};

export const configure = (newConfig: UserSession) => {
  config = {
    ...config,
    ...newConfig,
  };
};

/**
 * some info
 */
export const getConfig = () => config;
