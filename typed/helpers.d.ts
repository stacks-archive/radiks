import Model from './model';
export declare const GROUP_MEMBERSHIPS_STORAGE_KEY = "GROUP_MEMBERSHIPS_STORAGE_KEY";
export declare const decryptObject: (encrypted: any, model: Model) => Promise<any>;
export declare const encryptObject: (model: Model) => Promise<{
    _id: string;
    createdAt?: number;
    updatedAt?: number;
    signingKeyId?: string;
}>;
export declare const clearStorage: () => void;
export declare const userGroupKeys: () => any;
export declare const addPersonalSigningKey: (signingKey: any) => void;
export declare const addUserGroupKey: (userGroup: any) => void;
export declare const requireUserSession: () => import("./types").UserSession;
export declare const loadUserData: () => {
    appPrivateKey: string;
    profile: Record<string, any>;
    username: string;
    hubUrl: string;
};
