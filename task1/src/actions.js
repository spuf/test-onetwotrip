const debug = require('debug')('app:actions');
const Actioner = require('../lib/actioner');
const Store = require('./../lib/store');

const CONNECT = Symbol('CONNECT');
const BE_LEADER = Symbol('BE_LEADER');
const BE_WORKER = Symbol('BE_WORKER');
const DISCONNECT = Symbol('DISCONNECT');

function init(store) {

  const checkingLeader = () => store.get(Store.LOOPS).checkingLeader;
  const extendingLeader = () => store.get(Store.LOOPS).extendingLeader;
  const pushingTasks = () => store.get(Store.LOOPS).pushingTasks;
  const poppingTasks = () => store.get(Store.LOOPS).poppingTasks;

  function connect() {
    debug('connect');
    return checkingLeader().start();
  }

  function beLeader() {
    debug('beLeader');
    return poppingTasks().stop()
      .then(() => pushingTasks().start())
      .then(() => checkingLeader().stop())
      .then(() => extendingLeader().start())
  }

  function beWorker() {
    debug('beWorker');
    return pushingTasks().stop()
      .then(() => poppingTasks().start())
      .then(() => extendingLeader().stop())
      .then(() => checkingLeader().start())
  }

  function disconnect() {
    debug('disconnect');
    return Promise.all([
      pushingTasks().stop(),
      poppingTasks().stop(),
      checkingLeader().stop(),
      extendingLeader().stop()
    ]);
  }

  const actions = new Actioner({
    [CONNECT]: connect,
    [BE_LEADER]: beLeader,
    [BE_WORKER]: beWorker,
    [DISCONNECT]: disconnect,
  });

  store.set(Store.ACTIONS, actions);
}

module.exports = {
  CONNECT,
  BE_LEADER,
  BE_WORKER,
  DISCONNECT,
  init
};
