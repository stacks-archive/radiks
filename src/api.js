import qs from 'qs';
import { getConfig } from './config';

export const sendNewGaiaUrl = async (gaiaURL) => {
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
  const { success, doc, message } = await response.json();
  if (!success) {
    throw new Error(`Error when saving model: '${message}'`);
  }
  return doc;
};

export const find = async (query) => {
  const { apiServer } = getConfig();
  const queryString = qs.stringify(query, { arrayFormat: 'brackets', encode: false });
  const url = `${apiServer}/radiks/models/find?${queryString}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
