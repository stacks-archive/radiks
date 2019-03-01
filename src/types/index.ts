export interface SchemaAttribute {
  type: String | Object | Array<any> | Number | Boolean;
  decrypted?: boolean;
}

export interface Schema {
  [key: string]: String | Object | Array<any> | Number | Boolean | SchemaAttribute;
}

export interface Attrs {
  createdAt?: number,
  updatedAt?: number,
  _id?: string
  [key: string]: any,
}

export interface UserSession {
  loadUserData: () => {
    appPrivateKey: string,
    profile: Object,
    username: string
  },

  putFile: (path: string, value: any, options: any) => string;
}
