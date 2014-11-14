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

module.exports = function send(child, message) {
  if (typeof child.send !== 'function') {
    // not a child process
    return setImmediate(child.emit.bind(child, 'message', message));
  }

  // cluster.fork(): child.process is process
  // childprocess.fork(): child is process
  var connected = child.process ? child.process.connected : child.connected;

  if (connected) {
    return child.send(message);
  }

  // just log warnning message
  var pid = child.process ? child.process.pid : child.pid;
  var err = new Error('channel closed');
  console.warn('[%s][sendmessage] WARN pid#%s channel closed, nothing send\nstack: %s',
    Date(), pid, err.stack);
};
