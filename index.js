/**!
 * sendmessage - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var IS_NODE_DEV_RUNNER = /node\-dev$/.test(process.env._ || '');
if (!IS_NODE_DEV_RUNNER && process.env.IS_NODE_DEV_RUNNER) {
  IS_NODE_DEV_RUNNER = true;
}

module.exports = function send(child, message) {
  // 如果没有 send 函数，说明 child 是一个 Master 进程，直接 emit 一个 message 事件给 child 进程本身
  if (typeof child.send !== 'function') {
    // not a child process
    return setImmediate(child.emit.bind(child, 'message', message));
  }

  // need to detect current process is node-dev start or not
  if (IS_NODE_DEV_RUNNER || process.env.SENDMESSAGE_ONE_PROCESS) {
    // run with node-dev, only one process
    // https://github.com/node-modules/sendmessage/issues/1
    return setImmediate(child.emit.bind(child, 'message', message));
  }

  // cluster.fork(): child.process is process
  // childprocess.fork(): child is process
  // Agent 子进程通过 child_process.fork() 函数创建出来的
  // Worker 子进程通过 cluster.fork() 函数创建出来的，而 cluster.fork() 函数又会调用 child_process.fork()，将其返回对象绑定在 worker.process 上
  // 所以 Worker 子进程对应的是 child.process.connected，而 Agent 子进程对应的是 child.connected
  var connected = child.process ? child.process.connected : child.connected;

  // 通过子进程的 send 函数向父进程发送消息
  if (connected) {
    return child.send(message);
  }

  // just log warnning message
  var pid = child.process ? child.process.pid : child.pid;
  var err = new Error('channel closed');
  console.warn('[%s][sendmessage] WARN pid#%s channel closed, nothing send\nstack: %s',
    Date(), pid, err.stack);
};
