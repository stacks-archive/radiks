declare class Central {
    static save(key: string, value: Record<string, any>): Promise<any>;
    static get(key: string): Promise<any>;
    static makeSignature(key: string): {
        username: string;
        signature: string;
    };
}
export default Central;
