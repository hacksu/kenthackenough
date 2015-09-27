'use strict';

var mongoose = require('mongoose');
var schema = require('validate');
var Device = require('../devices/model');

var eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  start: Date,
  end: Date,
  type: String,
  icon: String,
  location: String,
  group: {type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee'},
  notify: {type: Boolean, default: true}, // should we notify users
  notified: {type: Boolean, default: false} // have we notified users?
});

var Event = mongoose.model('Event', eventSchema);

var validate = function (event) {
  var test = schema({
    title: {
      type: 'string',
      required: true,
      message: 'You must provide a name for the event.'
    },
    description: {
      type: 'string',
      message: 'Invalid description'
    },
    start: {
      type: 'date',
      required: true,
      message: 'You must provide a start time.'
    },
    end: {
      type: 'date',
      required: true,
      message: 'You must provide an end time.'
    },
    type: {
      type: 'string',
      message: 'Invalid type'
    },
    icon: {
      type: 'string',
      message: 'Invalid icon'
    },
    location: {
      type: 'string',
      message: 'Invalid location'
    },
    group: {
      type: 'string',
      message: 'Invalid group'
    },
    notify: {
      type: 'boolean',
      message: 'Notify must be true or false'
    }
  }, {typecast: true});
  return test.validate(event);
};

/**
* Check for events we should notify people about
* We are checking once per minute
*
* This definitely isn't the best or most reliably way to solve this problem,
* but it works for now and I can't seem to find a good persistent job scheduler
* for node (lesson: don't use Agenda).
*/
setInterval(function () {
  var later = new Date();
  later.setMinutes(later.getMinutes() + 1);
  var earlier = new Date();
  earlier.setMinutes(earlier.getMinutes() - 1);
  Event
    .find({
      notify: true,
      start: {
        "$gt": earlier,
        "$lt": later
      }
    })
    .exec(function (err, events) {
      for (var event of events) {
        if (!event.notified) {
          Device.push(event.title, event.description);
          event.notified = true;
          event.save();
        }
      }
    });
}, 60 * 1000);

module.exports = Event;
module.exports.validate = validate;