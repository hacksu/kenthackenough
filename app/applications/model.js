var mongoose = require('mongoose');
var schema = require('validate');

var Application = mongoose.model('Application', {
  name: String,           // full name
  school: String,         // name of school
  phone: String,          // phone number
  shirt: String,          // t-shirt size
  demographic: Boolean,   // allowed to use demographic info?
  first: Boolean,         // is this your first hackathon?
  dietary: [String],      // an array of dietary restrictions
  year: String,           // the year in school
  age: Number,            // person's age
  gender: String,         // gender
  major: String,          // degree
  conduct: Boolean,       // agree to MLH code of conduct?
  travel: Boolean,        // need travel reimbursement?
  waiver: Boolean         // agreed to waiver?
});

var Helpers = {

  /**
  * Validate an application
  * @param app An object representing the submitted application attempt
  */
  validate: function (app) {
    var test = schema({
      name: {
        required: true,
        type: 'string',
        match: /.{2,32}/,
        message: 'Your name is required'
      },
      school: {
        required: true,
        type: 'string',
        match: /.{2,64}/,
        message: 'You must provide the name of your school'
      },
      phone: {
        required: true,
        type: 'number',
        match: /^[0-9]{10,20}$/,
        message: 'You must provide a valid phone number'
      },
      shirt: {
        required: true,
        type: 'string',
        match: /[XL|L|M|S]+/,
        message: 'You must provide your t-shirt size'
      },
      demographic: {
        required: true,
        type: 'boolean',
        message: 'You must agree to release demographic information'
      },
      first: {
        type: 'boolean',
        message: 'You must specify whether this is your first hackathon'
      },
      year: {
        required: true,
        type: 'string',
        message: 'You must provide a class standing'
      },
      age: {
        required: true,
        type: 'number',
        message: 'You must specify your age'
      },
      major: {
        required: true,
        type: 'string',
        message: 'You must specify your major'
      },
      conduct: {
        required: true,
        type: 'boolean',
        message: 'You must agree to the MLH Code of Conduct'
      },
      travel: {
        type: 'boolean',
        message: 'You must specify whether you will require travel reimbursement'
      },
      waiver: {
        required: true,
        type: 'boolean',
        message: 'You must agree to the terms of our event waiver'
      }
    }, {typecast: true});
    return test.validate(app);
  }

};

module.exports = Application;
module.exports.validate = Helpers.validate;