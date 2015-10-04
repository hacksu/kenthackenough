'use strict';

/**

GCM helper
----------

Usage:
let push = require('./helpers/push')('/messages');
push.send('create', message);

*/

let gcm = require('node-gcm');
let azure = require('azure');
let config = rootRequire('config/config');
let log = require('./logger');

module.exports = function (topic) {

  return {
    /**
    * Send a push notification to all services
    */
    send: function (action, doc) {
      this._gcm(action, doc);
      this._mpns(action, doc);
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
    },

    /**
    * Send a push notification via MPNS
    */
    _mpns: function (action, doc) {
      if (!config.mpns || !config.mpns.connectionString) return log.error('MPNS not configured');

      let nhs = azure.createNotificationHubService('khe', config.mpns.connectionString);
      nhs.mpns.sendToast(config.mpns.tag, {
        text1: action,
        text2: JSON.stringify(doc)
      }, (err) => {
        if (err) {
          log.error('[MPNS error]');
          log.error(err);
        } else {
          log.info('[MPNS success]');
        }
      });
    }
  };

};