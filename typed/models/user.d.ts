import Model from '../model';
import SigningKey from './signing-key';
import { Schema } from '../types/index';
export default class BlockstackUser extends Model {
    static className: string;
    static schema: Schema;
    static currentUser(): BlockstackUser;
    createSigningKey(): Promise<SigningKey>;
    static createWithCurrentUser(): Promise<{}>;
    sign(): Promise<this>;
}
