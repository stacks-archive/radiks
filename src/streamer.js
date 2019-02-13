import EventEmitter from 'wolfy87-eventemitter';

import { getConfig } from './config';

const EVENT_NAME = 'RADIKS_STREAM_MESSAGE';

export default class Streamer {
  static init() {
    if (this.initialized) {
      return this.socket;
    }
    const { apiServer } = getConfig();
    const socket = new WebSocket(`ws://${apiServer.replace(/^https?:\/\//, '')}/radiks/stream/`);
    this.emitter = new EventEmitter();
    this.socket = socket;
    this.initialized = true;
    socket.onmessage = (event) => {
      this.emitter.emit(EVENT_NAME, [event]);
    };
    return socket;
  }

  static addListener(callback) {
    this.init();
    this.emitter.addListener(EVENT_NAME, callback);
  }

  static removeListener(callback) {
    this.init();
    this.emitter.removeListener(EVENT_NAME, callback);
  }
}
