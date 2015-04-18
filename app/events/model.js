var mongoose = require('mongoose');
var schema = require('validate');

var Event = mongoose.model('Event', {
  title: String,
  description: String,
  start: Date,
  end: Date,
  type: String,
  icon: String,
  location: String,
  group: {type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee'},
  notify: {type: Boolean, default: true}
});

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

module.exports = Event;
module.exports.validate = validate;