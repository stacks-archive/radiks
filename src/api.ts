import { stringify } from 'qs';
import { getConfig } from './config';
import Model from './model';
import { CentralSaveData } from './storages/indexer';

export interface FindQuery {
  limit?: number,
  [x: string]: any,
}

export const sendNewGaiaUrl = async (gaiaURL: string): Promise<boolean> => {
  const { indexer } = getConfig();
  return indexer.sendNewGaiaUrl(gaiaURL);
};



export const find = async (query: FindQuery) => {
  const { indexer } = getConfig();
  return indexer.find(query);
};

export const count = async (query: FindQuery) => {
  const { indexer } = getConfig();
  return indexer.count(query);
};

export const saveCentral = async (data: CentralSaveData) => {
  const { indexer } = getConfig();
  return indexer.saveCentral(data);
};

export const fetchCentral = async (key: string, username: string, signature: string) => {
  const { indexer } = getConfig();
  return indexer.fetchCentral(key, username, signature);
};

export const destroyModel = async (model: Model) => {
  const { indexer } = getConfig();
  return indexer.destroyModel(model);
};
