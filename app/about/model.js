var mongoose = require('mongoose');
var schema = require('validate');

var About = mongoose.model('About', {
  text: String, // stored as markdown
  updated: Date
});

var validate = function (about) {

  var test = schema({
    text: {
      type: 'string',
      required: true,
      message: 'You must provide a block of text'
    }
  });

  return test.validate(about);

};

module.exports = About;
module.exports.validate = validate;