import { UserSession } from './types/index';
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
