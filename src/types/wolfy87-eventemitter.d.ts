declare module 'wolfy87-eventemitter' {
  export default class EventEmitter {
    getListeners: () => Array<Function>;
    addListener: (key: string, callback: Function) => void;
    removeListener: (key: string, callback: Function) => void;
  }
}
