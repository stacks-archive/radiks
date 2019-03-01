declare class Central {
    static save(key: string, value: Object): Promise<any>;
    static get(key: string): Promise<any>;
    static makeSignature(key: string): {
        username: string;
        signature: string;
    };
}
export default Central;
