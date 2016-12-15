const debug = require('debug')('app:loops');
const Redlock = require('redlock');
const Looper = require('../lib/looper');
const Store = require('./../lib/store');
const Actions = require('./actions');

const TASK_QUEUE = 'task_queue';
const MASTER_LOCK = 'master_lock';

module.exports = function ({store, redlock, client, taskListener}) {
  const LOCK_TIME = store.get(Store.LOCK_TIME);
  const PUSH_TIME = store.get(Store.PUSH_TIME);
  const POP_TIME = store.get(Store.POP_TIME);
  const actions = () => store.get(Store.ACTIONS);

  let leaderLock = null;
  const checkingLeader = new Looper(function (done, stop) {
    redlock.lock(MASTER_LOCK, LOCK_TIME, (err, lock) => {
      leaderLock = lock || null;
      if (err) {
        if (err instanceof Redlock.LockError) {
          debug('I am worker');
          done();
          actions().run(Actions.BE_WORKER);
          return;
        } else {
          debug('Lock error', err);
          stop();
          return;
        }
      }
      debug('I am leader');
      done();
      actions().run(Actions.BE_LEADER);
    });
  }, LOCK_TIME);

  const extendingLeader = new Looper(function (done, stop) {
    if (!leaderLock) {
      stop();
    }
    leaderLock.extend(LOCK_TIME, (err) => {
      if (err) {
        if (err instanceof Redlock.LockError) {
          debug('I am worker');
          done();
          actions().run(Actions.BE_WORKER);
          return;
        } else {
          debug('Extend lock error', err);
          stop();
          return;
        }
      }
      debug('I am leader');
      done();
      actions().run(Actions.BE_LEADER);
    });
  }, Math.floor(LOCK_TIME / 2));

  const pushingTasks = new Looper(function (done, stop) {
    let task = store.get(Store.GENERATE_TASK)();
    debug('Push task:', task);
    client.rpush(TASK_QUEUE, task, function (err) {
      if (err) {
        debug('Push task error:', err);
        stop();
        return;
      }
      done();
    });
  }, PUSH_TIME);

  const poppingTasks = new Looper(function (done, stop) {
    taskListener.blpop(TASK_QUEUE, Math.floor(POP_TIME / 1000), function (err, result) {
      if (err) {
        debug('Pop task error:', err);
        stop();
        return;
      }
      if (result !== null) {
        debug('Pop task:', result);
        store.get(Store.SOLVE_TASK)(result[1]);
      }
      done();
    })

  });

  store.set(Store.LOOPS, {
    checkingLeader,
    extendingLeader,
    pushingTasks,
    poppingTasks
  });
};
