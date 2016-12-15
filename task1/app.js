const redis = require('redis');
const client = redis.createClient({
  retry_strategy: function (options) {
    return Math.min(options.attempt * 100, 5000);
  }
});

const ERROR_LIST = 'error_list';

if (process.argv[process.argv.length - 1] == 'getErrors') {
  const CHUNK_SIZE = 100;

  function quit() {
    client.on('end', function () {
      process.exit();
    });
    client.quit();
  }

  function processErrors() {
    client.batch()
      .lrange(ERROR_LIST, 0, CHUNK_SIZE - 1)
      .ltrim(ERROR_LIST, CHUNK_SIZE, -1)
      .exec(function (err, result) {
        if (err) {
          console.log('Error', err);
          quit();
          return;
        }
        if (result[1] != 'OK') {
          console.log('Remove error', result[1]);
          quit();
          return;
        }
        if (result[0].length <= 0) {
          quit();
          return;
        }
        result[0].forEach((task) => console.log(task));
        process.nextTick(processErrors);
      });
  }
  processErrors();
  return;
}

const debug = require('debug')('app:main');
const crypto = require('crypto');
const Redlock = require('redlock');
const taskListener = client.duplicate();
const redlock = new Redlock([client], {retryCount: 1});

const Store = require('./lib/store');

let store = new Store();

store.set(Store.LOCK_TIME, 6000);
store.set(Store.PUSH_TIME, 500);
store.set(Store.POP_TIME, 5000);

const SOLVED_COUNTER = 'solved_tasks';

store.set(Store.SOLVE_TASK, function (task) {
  debug('Solve task', task);
  client.incr(SOLVED_COUNTER);
  if (Math.random() < 0.05) {
    debug('Task with error!');
    client.rpush(ERROR_LIST, task);
  }
});
store.set(Store.GENERATE_TASK, function () {
  let task = crypto.randomBytes(16).toString('hex');
  debug('Generate task', task);
  return task;
});

const Actions = require('./src/actions');
Actions.init(store);
require('./src/loops')({store, client, redlock, taskListener});

client.on('ready', function () {
  debug('ready');
  store.get(Store.ACTIONS).run(Actions.CONNECT);
});

client.on('end', function () {
  debug('disconnected');
  store.get(Store.ACTIONS).run(Actions.DISCONNECT);
});
