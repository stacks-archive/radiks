import { stringify } from 'qs';
import { getConfig } from './config';

export const sendNewGaiaUrl = async (gaiaURL : string) => {
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
  const { boolean: success, string: message } = await response.json();
  if (!success) {
    throw new Error(`Error when saving model: '${message}'`);
  }
  return success;
};

interface FindQuery {
  limit: number,

}

export const find = async (query: FindQuery) => {
  const { apiServer } = getConfig();
  const queryString = stringify(query, { arrayFormat: 'brackets', encode: false });
  const url = `${apiServer}/radiks/models/find?${queryString}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const saveCentral = async (data) => {
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

export const fetchCentral = async (key, username, signature) => {
  const { apiServer } = getConfig();
  const queryString = stringify({ username, signature });
  const url = `${apiServer}/radiks/central/${key}?${queryString}`;
  const response = await fetch(url);
  const value = await response.json();
  return value;
};
