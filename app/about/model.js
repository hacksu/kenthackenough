'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

/**
* About page model
*/
let About = mongoose.model('About', {
  text: String, // stored as markdown
  updated: Date
});

/**
* Validate the about page schema
*/
function validate(about) {

  let test = schema({
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