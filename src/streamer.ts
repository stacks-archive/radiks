import EventEmitter from 'wolfy87-eventemitter';

import { getConfig } from './config';

const EVENT_NAME = 'RADIKS_STREAM_MESSAGE';

export default class Streamer {
  static initialized: boolean;
  static socket: WebSocket;
  static emitter: EventEmitter;

  static init() {
    if (this.initialized) {
      return this.socket;
    }
    const { apiServer } = getConfig();
    const protocol = document.location.protocol === 'http:' ? 'ws' : 'wss';
    const socket = new WebSocket(`${protocol}://${apiServer.replace(/^https?:\/\//, '')}/radiks/stream/`);
    this.emitter = new EventEmitter();
    this.socket = socket;
    this.initialized = true;
    socket.onmessage = (event) => {
      this.emitter.emit(EVENT_NAME, [event]);
    };
    return socket;
  }

  static addListener(callback: (args: any[]) => void) {
    this.init();
    this.emitter.addListener(EVENT_NAME, callback);
  }

  static removeListener(callback: Function) {
    this.init();
    this.emitter.removeListener(EVENT_NAME, callback);
  }
}
