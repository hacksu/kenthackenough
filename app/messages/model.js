'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

let Message = mongoose.model('Message', {
  created: {type: Date, default: Date.now},
  text: String
});

function validate(message) {
  let test = schema({
    text: {
      type: 'string',
      required: true,
      message: 'Your message must have text'
    }
  }, {typecast: true});
  return test.validate(message);
};

module.exports = Message;
module.exports.validate = validate;