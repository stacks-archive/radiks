import EventEmitter from 'wolfy87-eventemitter';
export default class Streamer {
    static initialized: boolean;
    static socket: WebSocket;
    static emitter: EventEmitter;
    static init(): WebSocket;
    static addListener(callback: (args: any[]) => void): void;
    static removeListener(callback: Function): void;
}
