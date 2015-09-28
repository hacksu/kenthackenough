'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

/**
* The Url model
*/
let Url = mongoose.model('Url', {
  full: String,
  short: {type: String, unique: true}
});

/**
* Validate a URL object
* @param url {full: String, short: String}
* @return An array of error messages
*/
function validate(url) {
  let test = schema({
    full: {
      type: 'string',
      required: true,
      message: 'You must provide a full URL'
    },
    short: {
      type: 'string',
      required: true,
      message: 'You must provide a URL to shorten to'
    }
  });
  return test.validate(url);
};

module.exports = Url;
module.exports.validate = validate;