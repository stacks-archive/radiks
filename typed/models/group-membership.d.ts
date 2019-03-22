import Model from '../model';
interface UserGroupKeys {
    userGroups: {
        [userGroupId: string]: string;
    };
    signingKeys: {
        [signingKeyId: string]: string;
    };
}
export default class GroupMembership extends Model {
    static className: string;
    static schema: {
        userGroupId: StringConstructor;
        username: {
            type: StringConstructor;
            decrypted: boolean;
        };
        signingKeyPrivateKey: StringConstructor;
        signingKeyId: StringConstructor;
    };
    static fetchUserGroups(): Promise<UserGroupKeys>;
    static cacheKeys(): Promise<void>;
    static clearStorage(): Promise<void>;
    static userGroupKeys(): any;
    encryptionPublicKey(): Promise<any>;
    encryptionPrivateKey(): string;
    getSigningKey(): {
        _id: string;
        privateKey: string;
    };
    fetchUserGroupSigningKey(): Promise<{
        _id: string;
        signingKeyId: string;
    }>;
}
export {};
