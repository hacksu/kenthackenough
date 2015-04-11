var mongoose = require('mongoose');
var schema = require('validate');

var Event = mongoose.model('Event', {
  name: String,
  start: Date,
  end: Date,
  group: {type: String, enum: ['attendee', 'staff', 'admin'], default: 'attendee'},
  notify: {type: Boolean, default: true}
});

var validate = function (event) {
  var test = schema({
    name: {
      type: 'string',
      required: true,
      message: 'You must provide a name for the event.'
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
    group: {
      type: 'string'
    },
    notify: {
      type: 'boolean'
    }
  }, {typecast: true});
  return test.validate(event);
};

module.exports = Event;
module.exports.validate = validate;