import Model from './model';
export declare const sendNewGaiaUrl: (gaiaURL: string) => Promise<boolean>;
export interface FindQuery {
    limit?: number;
    [x: string]: any;
}
export declare const find: (query: FindQuery) => Promise<any>;
interface CentralSaveData {
    signature: string;
    username: string;
    key: string;
    value: any;
}
export declare const saveCentral: (data: CentralSaveData) => Promise<any>;
export declare const fetchCentral: (key: string, username: string, signature: string) => Promise<any>;
export declare const destroyModel: (model: Model) => Promise<any>;
export {};
