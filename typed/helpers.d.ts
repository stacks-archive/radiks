export declare const GROUP_MEMBERSHIPS_STORAGE_KEY = "GROUP_MEMBERSHIPS_STORAGE_KEY";
export declare const decryptObject: (encrypted: any, model: any) => Promise<any>;
export declare const encryptObject: (model: any) => Promise<any>;
export declare const clearStorage: () => void;
export declare const userGroupKeys: () => any;
export declare const addPersonalSigningKey: (signingKey: any) => void;
export declare const addUserGroupKey: (userGroup: any) => void;
export declare const requireUserSession: () => import("./types/index").UserSession;
export declare const loadUserData: () => {
    appPrivateKey: string;
    profile: Object;
    username: string;
    hubUrl: string;
};
