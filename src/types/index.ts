export interface SchemaAttribute {
  type: string | Record<string, any> | any[] | number | boolean;
  decrypted?: boolean;
}

export interface Schema {
  [key: string]: SchemaAttribute | string | Record<string, any> | any[] | number | boolean;
}

export interface Attrs {
  createdAt?: number,
  updatedAt?: number,
  signingKeyId?: string,
  _id?: string
  [key: string]: any,
}

interface GaiaScope {
  scope: string,
  domain: string,
}

export interface UserSession {
  loadUserData: () => {
    appPrivateKey: string,
    profile: Record<string, any>,
    username: string,
    hubUrl: string,
  },

  putFile: (path: string, value: any, options: any) => string;
  connectToGaiaHub: (url: string, privateKey: string, scopes: GaiaScope[]) => any;
}
