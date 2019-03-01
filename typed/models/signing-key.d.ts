import Model from '../model';
import { Attrs } from '../types/index';
interface SigningKeyAttrs extends Attrs {
    publicKey?: string;
    privateKey?: string | any;
    userGroupId?: string;
}
export default class SigningKey extends Model {
    static className: string;
    attrs: SigningKeyAttrs;
    static schema: {
        publicKey: {
            type: StringConstructor;
            decrypted: boolean;
        };
        privateKey: StringConstructor;
        userGroupId: {
            type: StringConstructor;
            decrypted: boolean;
        };
    };
    static defaults: {
        updatable: boolean;
    };
    static create(attrs?: {}): Promise<SigningKey>;
    encryptionPrivateKey: () => string;
}
export {};
