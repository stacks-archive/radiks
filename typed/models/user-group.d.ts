import Model from '../model';
import GroupInvitation from './group-invitation';
import { Schema } from '../types/index';
interface Member {
    username: string;
    inviteId: string;
}
export default class UserGroup extends Model {
    privateKey?: string;
    static schema: Schema;
    static defaults: {
        members: Member[];
    };
    static find(id: string): Promise<UserGroup>;
    create(): Promise<this>;
    makeGroupMembership(username: string): Promise<GroupInvitation>;
    static myGroups(): Promise<Model[]>;
    publicKey(): string;
    encryptionPublicKey(): Promise<string>;
    encryptionPrivateKey(): any;
    makeGaiaConfig(): Promise<any>;
    static modelName: () => string;
    getSigningKey(): {
        privateKey: any;
        id: any;
    };
}
export {};
