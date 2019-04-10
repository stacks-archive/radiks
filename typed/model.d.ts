import EventEmitter from 'wolfy87-eventemitter';
import { FindQuery } from './api';
import { Schema, Attrs } from './types/index';
interface FetchOptions {
    decrypt?: boolean;
}
export default class Model {
    static schema: Schema;
    static defaults: any;
    static className?: string;
    static emitter?: EventEmitter;
    schema: Schema;
    _id: string;
    attrs: Attrs;
    static fromSchema(schema: Schema): typeof Model;
    static fetchList<T extends Model>(_selector?: FindQuery, { decrypt }?: FetchOptions): Promise<T[]>;
    static findOne<T extends Model>(_selector?: FindQuery, options?: FetchOptions): Promise<T>;
    static findById<T extends Model>(_id: string, fetchOptions?: Record<string, any>): Promise<Model>;
    /**
     * Fetch all models that are owned by the current user.
     * This only includes 'personally' owned models, and not those created
     * as part of a UserGroup
     *
     * @param {Object} _selector - A query to include when fetching models
     */
    static fetchOwnList(_selector?: FindQuery): Promise<Model[]>;
    constructor(attrs?: Attrs);
    save(): Promise<{}>;
    encrypted(): Promise<{
        _id: string;
        createdAt?: number;
        updatedAt?: number;
        signingKeyId?: string;
    }>;
    saveFile(encrypted: Record<string, any>): string;
    blockstackPath(): string;
    fetch({ decrypt }?: {
        decrypt?: boolean;
    }): Promise<this>;
    decrypt(): Promise<this>;
    update(attrs: Attrs): void;
    sign(): Promise<true | this>;
    getSigningKey(): any;
    encryptionPublicKey(): Promise<string>;
    encryptionPrivateKey(): string;
    static modelName(): string;
    modelName(): string;
    isOwnedByUser(): boolean;
    static onStreamEvent: (_this: any, [event]: [any]) => void;
    static addStreamListener(callback: () => void): void;
    static removeStreamListener(callback: () => void): void;
    destroy(): Promise<boolean>;
    beforeSave(): void;
    afterFetch(): void;
}
export {};
