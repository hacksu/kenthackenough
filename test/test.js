'use strict';

var app = require('../app').app;
var should = require('should');
var request = require('supertest');
var User = require('../app/users/model');

// the test suite
var users = require('./modules/users');
var urls = require('./modules/urls');
var emails = require('./modules/emails');
var live = require('./modules/live');
var tickets = require('./modules/tickets');
var news = require('./modules/news');
var events = require('./modules/events');
var projects = require('./modules/projects');
var statistics = require('./modules/statistics');
var about = require('./modules/about');
var devices = require('./modules/devices');

describe('API v1.0', function () {

  // Create an admin user
  before(function (done) {
    var salt = User.Helpers.salt();
    var admin = new User({
      email: 'admin@test.com',
      role: 'admin',
      password: User.Helpers.hash('pass', salt),
      salt: salt
    });
    admin.save(function (err, user) {
      if (err) throw err;
      done();
    });
  });

  // Create test user
  before(function (done) {
    var salt = User.Helpers.salt();
    var person = new User({
      email: 'person@test.com',
      role: 'attendee',
      password: User.Helpers.hash('pass', salt),
      salt: salt
    });
    person.save(function (err, user) {
      if (err) throw err;
      done();
    });
  });

  // Users and Applications
  users((admin) => {

    urls(admin.key, admin.token);
    emails(admin.key, admin.token);
    live(admin.key, admin.token);
    tickets(admin.key, admin.token);
    news(admin.key, admin.token);
    events(admin.key, admin.token);
    projects();
    statistics(admin.key, admin.token);
    about(admin.key, admin.token);
    devices();

  });

  // Remove the admin user
  after(function (done) {
    User.remove({email: 'admin@test.com'}, function (err) {
      if (err) throw err;
      done();
    });
  });

  // Remove the test user
  after(function (done) {
    User.remove({email: 'myperson@test.com'}, function (err) {
      if (err) throw err;
      done();
    });
  });

});