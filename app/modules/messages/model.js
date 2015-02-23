var mongoose = require('mongoose');
var schema = require('validate');

var Message = mongoose.model('Message', {
  created: {type: Date, default: Date.now},
  text: String
});

var validate = function (message) {
  var test = schema({
    text: {
      type: 'string',
      required: true
    }
  }, {typecast: true});
  return test.validate(message);
};

module.exports = Message;
module.exports.validate = validate;