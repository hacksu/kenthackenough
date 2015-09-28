'use strict';

let bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'khe',
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      level: 'error',
      path: '/var/tmp/kenthackenough.log'
    }
  ]
});