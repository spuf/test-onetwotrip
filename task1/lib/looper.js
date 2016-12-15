const debug = require('debug')('app:looper');

class Looper {
  constructor(cb, timeout = 0) {
    this._execCallback = cb;
    this._executing = false;
    this._halting = false;
    this._working = false;
    this._timeout = timeout;
    this._timeoutHandle = null;
    this._stopCallback = null;

    this._tick = tick.bind(this);
    this._tock = () => process.nextTick(tock.bind(this));
    this._stopped = () => process.nextTick(stopped.bind(this));
  }

  start() {
    if (this._working) {
      debug('already started');
      return Promise.resolve();
    }
    debug('starting...');
    this._working = true;
    this._tick();
    return Promise.resolve();
  }

  stop() {
    if (!this._working) {
      debug('already stopped');
      return Promise.resolve();
    }
    debug('stopping...');
    let promise = new Promise((resolve) => this._stopCallback = resolve);
    this._halting = true;
    if (!this._executing) {
      debug('clear timeout...');
      clearTimeout(this._timeoutHandle);
      this._stopped();
    }
    return promise;
  }
}

function tick() {
  if (this._executing) {
    debug('already ticked');
    return;
  }
  debug('tick...');
  this._executing = true;
  this._execCallback.call(null, this._tock, this._stopped);
}

function tock() {
  if (!this._executing) {
    debug('already tocked');
    return;
  }
  debug('tock...');
  this._executing = false;
  if (this._halting) {
    debug('halting...');
    this._stopped();
  } else {
    this._timeoutHandle = setTimeout(this._tick, this._timeout);
  }
}

function stopped() {
  debug('stopped');
  if (typeof this._stopCallback == 'function') {
    process.nextTick(this._stopCallback);
  }
  this._stopCallback = null;
  this._halting = false;
  this._executing = false;
  this._working = false;
}

module.exports = Looper;
