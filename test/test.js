'use strict';

var app = require('../app').app;
var should = require('should');
var request = require('supertest');

// the test suite
var users = require('./modules/users');
var urls = require('./modules/urls');
var emails = require('./modules/emails');
var live = require('./modules/live');
var tickets = require('./modules/tickets');
var news = require('./modules/news');
var events = require('./modules/events');
var statistics = require('./modules/statistics');
var about = require('./modules/about');


users((admin) => {

  urls(admin.key, admin.token);
  emails(admin.key, admin.token);
  live(admin.key, admin.token);
  tickets(admin.key, admin.token);
  news(admin.key, admin.token);
  events(admin.key, admin.token);
  statistics(admin.key, admin.token);
  about(admin.key, admin.token);

});