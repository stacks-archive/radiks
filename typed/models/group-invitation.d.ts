import Model from '../model';
import GroupMembership from './group-membership';
import UserGroup from './user-group';
import { Schema } from '../types/index';
export default class GroupInvitation extends Model {
    static className: string;
    userPublicKey: string;
    static schema: Schema;
    static defaults: {
        updatable: boolean;
    };
    static makeInvitation(username: string, userGroup: UserGroup): Promise<GroupInvitation>;
    activate(): Promise<true | GroupMembership>;
    encryptionPublicKey(): Promise<string>;
    encryptionPrivateKey(): string;
}
