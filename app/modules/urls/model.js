var mongoose = require('mongoose');
var schema = require('validate');

/**
* The Url model
*/
var Url = mongoose.model('Url', {
  full: String,
  short: {type: String, unique: true}
});

/**
* Validate a URL object
* @param url {full: String, short: String}
* @return An array of error messages
*/
var validate = function (url) {
  var test = schema({
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