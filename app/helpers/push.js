'use strict';

/**

GCM helper
----------

Usage:
let push = require('./helpers/push')('/messages');
push.send('create', message);

*/

let gcm = require('node-gcm');
let config = rootRequire('config/config');
let log = require('./logger');

module.exports = function (topic) {

  return {
    /**
    * Send a push notification to all services
    */
    send: function (action, doc) {
      this._gcm(action, doc);
    },

    /**
    * Send a push notification via GCM
    */
    _gcm: function (action, doc) {
      if (!config.gcm || !config.gcm.apiKey) return log.error('GCM not configured');

      let message = new gcm.Message({
        data: {
          action,
          document: doc
        }
      });

      let sender = new gcm.Sender(config.gcm.apiKey);
      sender.send(message, {topic: `/topics${topic}`}, 10, (err, result) => {
        if (err) {
          log.error(`[GCM error]`);
          log.error(err);
        } else {
          log.info(`[GCM result]`);
          log.info(result);
        }
      });
    }
  };

};