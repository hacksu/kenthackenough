module.exports = {

  // port used for API and web interface
  port: 3000,

 // log file for the express aplication
  log: 'app.log',

  // database to save users and other data to.
  mongo: {
    uri: 'mongodb://localhost:27017/test'
  },

  // gmail account to be used to send messages from
  gmail: {
    username: 'user@gmail.com',
    password: 'password123',
    from: 'First Last <first.last@example.com>'
  },

  // users to be added to the db from the start. Useful for adding an initial admin
  users: [{
    email: 'user@example.com',
    password: 'password123',
    role: 'attendee|User.staff|User.admin'
  }]

};