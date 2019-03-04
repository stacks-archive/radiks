export interface SchemaAttribute {
    type: String | Object | Array<any> | Number | Boolean;
    decrypted?: boolean;
}
export interface Schema {
    [key: string]: String | Object | Array<any> | Number | Boolean | SchemaAttribute;
}
export interface Attrs {
    createdAt?: number;
    updatedAt?: number;
    signingKeyId?: string;
    _id?: string;
    [key: string]: any;
}
interface GaiaScope {
    scope: string;
    domain: string;
}
export interface UserSession {
    loadUserData: () => {
        appPrivateKey: string;
        profile: Object;
        username: string;
        hubUrl: string;
    };
    putFile: (path: string, value: any, options: any) => string;
    connectToGaiaHub: (url: string, privateKey: string, scopes: Array<GaiaScope>) => any;
}
export {};
