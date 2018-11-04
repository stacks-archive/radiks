let config = {
  apiServer: '',
};

export const configure = (newConfig) => {
  config = {
    ...config,
    ...newConfig,
  };
};

export const getConfig = () => config;
