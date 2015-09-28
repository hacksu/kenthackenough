'use strict';

let bunyan = require('bunyan');
let logger;

if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'test') {

  logger = bunyan.createLogger({
    name: 'khe',
    streams: [
      {
        level: 'warn',
        path: '/var/tmp/kenthackenough.log'
      }
    ]
  });

} else {

  logger = bunyan.createLogger({
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

// Catch any uncaught exceptions, log them, and then continue to exit
process.on('uncaughtException', (err) => {
  logger.fatal(err);
  process.exit(1);
});

module.exports = logger;