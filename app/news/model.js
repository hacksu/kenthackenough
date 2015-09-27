'use strict';

var mongoose = require('mongoose');
var schema = require('validate');

/**
* The News List model
*/
var News = mongoose.model('News', {
  email: {type: String, unique: true},
  created: {type: Date, default: Date.now}
});

/**
* Validate a new News object
*/
var validate = function (n) {
  var test = schema({
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