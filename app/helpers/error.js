'use strict';

/**
* A few simple error handlers placed in the response object when used
* as a middleware.
*
* Usage:
*   res.internalError();
*   res.singleError('My error message');
*   res.multiError(['One', 'Two', 'Three']);
*/
let log = require('./logger');

module.exports = function (req, res, next) {

  res.internalError = function (status=500) {
    log.error(`[${req.method}] ${req.path} | ${status} Internal error`);
    res
      .status(status)
      .send({errors: ['An internal error has occurred.']});
  };

  res.clientError = function (message='Malformed request', status=400) {
    log.error(`[${req.method}] ${req.path} | ${status} Error: "${message}"`);
    res
      .status(status)
      .send({errors: [message]});
  };

  res.singleError = function (message, status=500) {
    log.error(`[${req.method}] ${req.path} | ${status} Error: "${message}"`);
    res
      .status(status)
      .send({errors: [message]});
  };

  res.multiError = function (messages, status=500) {
    log.error(`[${req.method}] ${req.path} | ${status} Error: "${messages}"`);
    res
      .status(status)
      .send({errors: messages});
  };

  next();

};