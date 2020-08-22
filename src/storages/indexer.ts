import { Model } from "..";

export interface FindQuery {
    limit?: number,
    [x: string]: any,
}

export interface CentralSaveData {
    signature: string,
    username: string,
    key: string,
    value: any,
  }

export interface Indexer {
    sendNewGaiaUrl(gaiaURL: string): Promise<boolean>;
    find(query: FindQuery): Promise<any>;
    count(query: FindQuery): Promise<any>;
    saveCentral(data: CentralSaveData);
    fetchCentral(key: string, username: string, signature: string);
    destroyModel(model: Model);
}