let config = {
  apiServer: '',
  userSession: null,
};

export const configure = (newConfig) => {
  config = {
    ...config,
    ...newConfig,
  };
};

export const getConfig = () => config;
