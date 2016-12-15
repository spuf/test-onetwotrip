const debug = require('debug')('app:actioner');

class Actioner {
  constructor(actions) {
    this._actions = actions;
    this._next = null;
    this._wait = false;
    this._last = Promise.resolve();
    this._execActionBonded = this._execAction.bind(this);
  }

  run(name) {
    if (typeof this._actions[name] != 'function') {
      throw new Error('Unknown action name');
    }
    debug('run', name);
    this._next = name;

    if (this._wait) {
      return;
    }
    this._wait = true;
    this._last = this._last.then(this._execActionBonded)
      .catch((err) => debug('Action error:', err));
  }

  _pickNext() {
    let next = this._next;
    this._next = null;
    return next;
  }

  _execAction() {
    this._wait = false;
    let name = this._pickNext();
    if (!name) {
      return;
    }
    debug('execAction', name);
    let result = this._actions[name].call();
    if (!(result instanceof Promise)) {
      throw new Error('Action should return Promise');
    }
    return result;
  }
}

module.exports = Actioner;
