import Model from '../model';
import { Attrs } from '../types/index';
interface UserGroupKeys {
    userGroups: {
        [userGroupId: string]: string;
    };
    signingKeys: {
        [signingKeyId: string]: string;
    };
}
interface GroupMembershipAttrs extends Attrs {
    userGroupId?: string | any;
    username?: string;
    signingKeyPrivateKey?: string | any;
    signingKeyId?: string | any;
}
export default class GroupMembership extends Model {
    static className: string;
    attrs: GroupMembershipAttrs;
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
