module.exports = {

  port: 3000,

  log: 'app.log',

  mongo: {
    uri: 'mongodb://localhost:27017/test'
  },

  gmail: {
    username: 'user@gmail.com',
    password: 'password123',
    from: 'First Last <first.last@example.com>'
  }

};