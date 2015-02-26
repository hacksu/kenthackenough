module.exports = {

  // Port used for API and web interface
  port: 3000,

 // Log file for the express aplication
  log: 'app.log',

  // Database to save users and other data to
  mongo: {
    uri: 'mongodb://localhost:27017/test'
  },

  // Gmail account to be used to send messages from
  gmail: {
    username: 'user@gmail.com',
    password: 'password123',
    from: 'First Last <first.last@example.com>'
  },

  // Users to be added to the db upon starting the app. Useful for adding an initial admin
  users: [{
    email: 'user@example.com',
    password: 'password123',
    role: 'attendee|User.staff|User.admin'
  }]

};
