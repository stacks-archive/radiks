declare module 'wolfy87-eventemitter' {
  export default class EventEmitter {
    getListeners: () => Function[];
    addListener: (key: string, callback: Function) => void;
    removeListener: (key: string, callback: Function) => void;
    emit: (key: string, args: any[]) => void;
  }
}
