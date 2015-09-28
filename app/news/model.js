'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

/**
* The News List model
*/
let News = mongoose.model('News', {
  email: {type: String, unique: true},
  created: {type: Date, default: Date.now}
});

/**
* Validate a new News object
*/
function validate(n) {
  let test = schema({
    email: {
      type: 'string',
      required: true,
      message: 'You must provide an email address.'
    }
  });
  return test.validate(n);
};

module.exports = News;
module.exports.validate = validate;