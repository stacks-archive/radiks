import { RadiksIndexer } from './storages/radiks.indexer';
import { UserSession } from 'blockstack';
import { Indexer } from './storages/indexer';

interface Config {
  apiServer: string,
  userSession: UserSession,
  indexer: Indexer
}

let config: Config = {
  apiServer: '',
  userSession: null,
  indexer: new RadiksIndexer()
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
