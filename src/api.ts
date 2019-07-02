import { stringify } from 'qs';
import { getConfig } from './config';
import Model from './model';

export const sendNewGaiaUrl = async (gaiaURL: string): Promise<boolean> => {
  const { apiServer } = getConfig();
  const url = `${apiServer}/radiks/models/crawl`;
  // console.log(url, gaiaURL);
  const data = { gaiaURL };
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  const { success, message } = await response.json();
  if (!success) {
    throw new Error(`Error when saving model: '${message}'`);
  }
  return success;
};

export interface FindQuery {
  limit?: number,
  [x: string]: any,
}

export const find = async (query: FindQuery) => {
  const { apiServer } = getConfig();
  const queryString = stringify(query, { arrayFormat: 'brackets', encode: false });
  const url = `${apiServer}/radiks/models/find?${queryString}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const count = async (query: FindQuery) => {
  const { apiServer } = getConfig();
  const queryString = stringify(query, { arrayFormat: 'brackets', encode: false });
  const url = `${apiServer}/radiks/models/count?${queryString}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

interface CentralSaveData {
  signature: string,
  username: string,
  key: string,
  value: any,
}

export const saveCentral = async (data: CentralSaveData) => {
  const { apiServer } = getConfig();
  const url = `${apiServer}/radiks/central`;

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  const { success } = await response.json();
  return success;
};

export const fetchCentral = async (key: string, username: string, signature: string) => {
  const { apiServer } = getConfig();
  const queryString = stringify({ username, signature });
  const url = `${apiServer}/radiks/central/${key}?${queryString}`;
  const response = await fetch(url);
  const value = await response.json();
  return value;
};

export const destroyModel = async (model: Model) => {
  const { apiServer } = getConfig();
  const queryString = stringify({ signature: model.attrs.radiksSignature });
  const url = `${apiServer}/radiks/models/${model._id}?${queryString}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });
  const data = await response.json();
  console.log(data);
  return data.success;
};
