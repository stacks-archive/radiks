let config = {
  apiServer: '',
  couchDBUrl: 'http://127.0.0.1:5984',
  couchDBName: 'radiks',
};

export const configure = (newConfig) => {
  config = {
    ...config,
    ...newConfig,
  };
};

export const getConfig = () => config;
