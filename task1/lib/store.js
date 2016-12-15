class Store {
  constructor() {
    this._store = {};
  }
  set(key, value) {
    if (this.has(key)) {
      throw new Error(`${key} already exists`);
    }
    this._store[key] = value;
  }
  get(key) {
    if (!this.has(key)) {
      throw new Error(`${key} not found`);
    }
    return this._store[key];
  }
  has(key) {
    return this._store.hasOwnProperty(key);
  }
}

Store.ACTIONS = Symbol('ACTIONS');
Store.LOOPS = Symbol('LOOPS');

Store.LOCK_TIME = Symbol('LOCK_TIME');
Store.PUSH_TIME = Symbol('PUSH_TIME');
Store.POP_TIME = Symbol('POP_TIME');

Store.SOLVE_TASK = Symbol('SOLVE_TASK');
Store.GENERATE_TASK = Symbol('GENERATE_TASK');

module.exports = Store;
