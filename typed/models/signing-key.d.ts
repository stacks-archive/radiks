import Model from '../model';
export default class SigningKey extends Model {
    static className: string;
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
