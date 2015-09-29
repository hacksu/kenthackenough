'use strict';

let mongoose = require('mongoose');
let schema = require('validate');
let push = rootRequire('app/helpers/push')('/events');
let io = rootRequire('app/helpers/socket')('/events');

let Event = mongoose.model('Event', {
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

function validate(event) {
  let test = schema({
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
setInterval(() => {
  let later = new Date();
  later.setMinutes(later.getMinutes() + 1);
  let earlier = new Date();
  earlier.setMinutes(earlier.getMinutes() - 1);
  Event
    .find({
      notify: true,
      start: {
        "$gt": earlier,
        "$lt": later
      }
    })
    .exec((err, events) => {
      for (let event of events) {
        if (!event.notified) {
          // send the notification and mark it as sent
          io.emit('notify', event);
          push.send('notify', event);
          event.notified = true;
          event.save();
        }
      }
    });
}, 60 * 1000);

module.exports = Event;
module.exports.validate = validate;