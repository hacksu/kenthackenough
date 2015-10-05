'use strict';

module.exports = {

  // The world-accessible base URL
  base: 'http://localhost:3000',

  // The port we want the app to run on (override with env.PORT)
  port: 3000,

  // The prefix for our router
  prefix: '/v1.0',

  // Log file (check for errors here)
  log: 'app.log',

  // Database to save users and other data to
  mongo: {
    uri: 'mongodb://localhost:27017/khe'
  },

  // Redis is used for caching
  redis: {
    host: '127.0.0.1',
    port: 6379
  },

  // SendGrid account info for sending emails
  // This is the account info you use to log into the SendGrid website
  sendgrid: {
    username: 'username',
    password: 'password',
    from: 'me@example.com',
    fromname: 'First Last'
  },

  // Users to be added to the db upon starting the app. Useful for adding an initial admin
  users: [{
    email: 'test@example.com',
    password: 'test',
    role: 'admin'
  }],

  // A list of enabled client IDs
  // Clients must use one of these IDs to get a token for a user
  clients: [
    'mocha', // You should leave this one here if you want to run `npm test`
    'abc123'
  ],

  // Google Cloud Messaging info
  gcm: {
    apiKey: 'YOUR_GOOGLE_API_KEY'
  }

};
