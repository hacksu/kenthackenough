'use strict';

let bunyan = require('bunyan');

if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'test') {

  module.exports = bunyan.createLogger({
    name: 'khe',
    streams: [
      {
        level: 'warn',
        path: '/var/tmp/kenthackenough.log'
      }
    ]
  });

} else {

  module.exports = bunyan.createLogger({
    name: 'khe',
    streams: [
      {
        level: 'info',
        stream: process.stdout
      },
      {
        level: 'warn',
        path: '/var/tmp/kenthackenough.log'
      }
    ]
  });

}