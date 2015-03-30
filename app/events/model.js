var mongoose = require('mongoose');
var schema = require('validate');

var Event = mongoose.model('Event', {
  name: String,
  start: Date,
  end: Date,
  group: String,
  notify: Boolean
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
      type: 'string',
      required: false
    },
    notify: {
      type: 'boolean',
      required: false
    }
  }, {typecast: true});
  return test.validate(event);
};

module.exports = Event;
module.exports.validate = validate;