var Agenda = require('agenda');
var config = rootRequire('config/config');
var exec = require('child_process').exec;
var Device = rootRequire('app/devices/model');

var agenda = new Agenda({
  db: {address: config.mongo.uri},
  processEvery: '1 minute'
});

/**
* Task to send out event notifications
*/
agenda.define('push notification', function (job, done) {
  var data = job.attrs.data;
  Device.push(data.title, data.body);
});

agenda.start();

module.exports = agenda;