'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

let _APPROVED = 'approved',
    _DENIED = 'denied',
    _WAITLISTED = 'waitlisted',
    _PENDING = 'pending';

let Application = mongoose.model('Application', {
  status: {type: String, enum: [_APPROVED, _DENIED, _WAITLISTED, _PENDING]},
  going: Boolean,         // rsvp status
  checked: Boolean,       // check-in status
  created: {type: Date, default: Date.now},
  door: Boolean,          // was this person registered during check-in?
  probable: {type: Boolean, default: false}, // is this person a probable attendee?

  // Actual application form
  name: String,           // full name
  school: String,         // name of school
  phone: String,          // phone number
  shirt: {type: String, enum: ['S', 'M', 'L', 'XL']}, // t-shirt size
  demographic: Boolean,   // allowed to use demographic info?
  first: Boolean,         // is this your first hackathon?
  dietary: [String],      // an array of dietary restrictions
  year: String,           // the year in school
  age: Number,            // person's age
  gender: String,         // gender
  major: String,          // degree
  conduct: Boolean,       // agree to MLH code of conduct?
  travel: Boolean,        // need travel reimbursement?
  resume: String,         // the file name of their resume
  link: String            // a link to github/linkedin/personal
});

let Helpers = {

  /**
  * Validate an application
  * @param app An object representing the submitted application attempt
  */
  validate: function (app) {
    let test = schema({
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
      dietary: {
        type: 'string',
        message: 'Dietary restrictions must be a string'
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
      gender: {
        required: true,
        type: 'string',
        message: 'You must specify a gender'
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
      resume: {
        type: 'string',
        message: 'You must upload your resume'
      },
      link: {
        type: 'string',
        message: 'You must provide a link'
      },
      going: {
        type: 'boolean',
        message: 'Specify RSVP status'
      }
    }, {typecast: true});
    return test.validate(app);
  }

};

module.exports = Application;
module.exports.validate = Helpers.validate;
module.exports.Status = {
  APPROVED: _APPROVED,
  DENIED: _DENIED,
  WAITLISTED: _WAITLISTED,
  PENDING: _PENDING
};