interface UserSession {
    loadUserData: () => {
        appPrivateKey: string;
        profile: Object;
        username: string;
    };
    putFile: (path: string, value: any, options: any) => string;
}
interface Config {
    apiServer: string;
    userSession: UserSession;
}
export declare const configure: (newConfig: UserSession) => void;
/**
 * some info
 */
export declare const getConfig: () => Config;
export {};
