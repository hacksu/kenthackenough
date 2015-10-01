'use strict';

module.exports = function (router) {

  /*
  ------------------------------------------------------------------------------
  | Middlware                                                                  |
  ------------------------------------------------------------------------------
  */
  let auth = require('./users/model').auth;

  /*
  ------------------------------------------------------------------------------
  | Controllers                                                                |
  ------------------------------------------------------------------------------
  */
  let about = require('./about/controller');
  let emails = require('./emails/controller');
  let events = require('./events/controller');
  let xports = require('./exports/controller');
  let messages = require('./messages/controller');
  let news = require('./news/controller');
  let resources = require('./resources/controller');
  let stats = require('./stats/controller');
  let tickets = require('./tickets/controller');
  let urls = require('./urls/controller');
  let users = require('./users/controller');
  let application = require('./users/application/controller');

  /*
  ------------------------------------------------------------------------------
  | Routes                                                                     |
  ------------------------------------------------------------------------------
  */

  // about
  router.put('/about', auth('admin', 'staff'), about.put);
  router.get('/about', about.get);

  // emails
  router.post('/emails', auth('admin'), emails.post);
  router.get('/emails', auth('admin', 'staff'), emails.get);
  router.delete('/emails/:id', auth('admin'), emails.delete);

  // events
  router.post('/events', auth('admin', 'staff'), events.post);
  router.get('/events/:id', events.find);
  router.get('/events', events.get);
  router.patch('/events/:id', auth('admin', 'staff'), events.patch);
  router.delete('/events/:id', auth('admin', 'staff'), events.delete);

  // exports
  router.get('/exports/attendees', xports.attendees);
  router.get('/exports/resumes', xports.resumes);

  // messages
  router.post('/messages', auth('admin', 'staff'), messages.post);
  router.get('/messages/:id', messages.find);
  router.get('/messages', messages.get);
  router.patch('/messages/:id', auth('admin', 'staff'), messages.patch);
  router.delete('/messages/:id', auth('admin', 'staff'), messages.delete);

  // news
  router.post('/news', news.post);
  router.get('/news/:id', auth('admin', 'staff'), news.find);
  router.get('/news', auth('admin', 'staff'), news.get);
  router.delete('/news/:id', auth('admin', 'staff'), news.delete);

  // resources
  router.get('/resources/icon', resources.icon);

  // stats
  router.get('/stats/registrations', auth('admin', 'staff'), stats.registrations);
  router.get('/stats/shirts', auth('admin', 'staff'), stats.shirts);
  router.get('/stats/dietary', auth('admin', 'staff'), stats.dietary);
  router.get('/stats/gender', auth('admin', 'staff'), stats.gender);
  router.get('/stats/schools', auth('admin', 'staff'), stats.schools);
  router.get('/stats/count', auth('admin', 'staff'), stats.count);

  // tickets
  router.post('/tickets', tickets.post);
  router.get('/tickets/:id', auth('admin', 'staff'), tickets.find);
  router.get('/tickets', auth('admin', 'staff'), tickets.get);
  router.patch('/tickets/:id', auth('admin', 'staff'), tickets.patch);
  router.delete('/tickets/:id', tickets.delete);

  // urls
  router.post('/urls', auth('admin', 'staff'), urls.post);
  router.get('/urls/go/:url', urls.resolve);
  router.get('/urls/:id', urls.find);
  router.get('/urls', auth('admin', 'staff'), urls.get);
  router.delete('/urls/:id', auth('admin', 'staff'), urls.delete);

  // application
  router.post('/users/application', auth(), application.create);
  router.get('/users/me/application', auth(), application.getMe);
  router.get('/users/application', auth('admin', 'staff'), application.list);
  router.get('/users/:id/application', auth('admin', 'staff'), application.find);
  router.patch('/users/me/application', auth(), application.patch);
  router.patch('/users/:id/application', auth('admin', 'staff'), application.patchById);
  router.delete('/users/me/application', auth(), application.delete);
  router.delete('/users/:id/application', auth('admin', 'staff'), application.deleteById);
  router.post('/users/application/resume', application.uploadResume);
  router.get('/users/application/resume/:filename', application.getResume);

  // users
  router.post('/users', users.create);
  router.post('/users/quick', auth('admin', 'staff'), users.quick);
  router.post('/users/token', users.token);
  router.post('/users/token/refresh', users.refresh);
  router.delete('/users/token', auth(), users.deleteToken);
  router.get('/users', auth('admin', 'staff'), users.get);
  router.get('/users/:id', auth('admin', 'staff'), users.find);
  router.patch('/users', auth(), users.patch);
  router.patch('/users/:id', auth('admin'), users.patchById);
  router.delete('/users/:id', auth('admin'), users.delete);
  router.post('/users/reset', users.resetPassword);

};