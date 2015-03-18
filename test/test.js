var app = require('../app').app;
var should = require('should');
var request = require('supertest');
var User = require('../app/users/model');

describe('API', function () {

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

  var personKey;
  var personToken;
  var adminKey;
  var adminToken;

  describe('Users', function () {

    var userKey;
    var userToken;
    var jdoeId;

    /**
    * Create a new user
    */
    it('should create a new user', function (done) {
      request(app)
        .post('/users')
        .send({
          email: 'user@test.com',
          password: 'pass'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          userKey = res.body.key;
          userToken = res.body.token;
          done();
        });
    });

    /**
    * Get a key and token
    */
    it('should get a key and token', function (done) {
      request(app)
        .post('/users/token')
        .send({
          email: 'person@test.com',
          password: 'pass'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          personKey = res.body.key;
          personToken = res.body.token;
          done();
        });
    });

    /**
    * Get a key and token for the admin
    */
    it('should get a key and token for the admin', function (done) {
      request(app)
        .post('/users/token')
        .send({
          email: 'admin@test.com',
          password: 'pass'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          adminKey = res.body.key;
          adminToken = res.body.token;
          done();
        });
    });

    /**
    * Quickly create a fully applied user (for registering at the door)
    */
    it('should quickly create a fully applied user', function (done) {
      request(app)
        .post('/users/quick')
        .auth(adminKey, adminToken)
        .send({
          name: 'John Doe',
          email: 'jdoe@test.com',
          phone: '5555555555'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('email');
          res.body.should.have.property('phone');
          res.body.name.should.equal('John Doe');
          res.body.email.should.equal('jdoe@test.com');
          res.body.phone.should.equal('5555555555');
          jdoeId = res.body._id;
          done();
        });
    });

    /**
    * Remove a token
    */
    it('should remove a token', function (done) {
      request(app)
        .delete('/users/token')
        .auth(userKey, userToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });

    /**
    * Get a list of all users
    */
    it('should get a list of all users', function (done) {
      request(app)
        .get('/users')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.users.length.should.be.above(0);
          res.body.users[0].should.have.property('_id');
          res.body.users[0].should.have.property('email');
          res.body.users[0].should.have.property('role');
          res.body.users[0].should.have.property('created');
          done();
        });
    });

    /**
    * Get a user by ID
    */
    it('should get a user by ID', function (done) {
      request(app)
        .get('/users/'+userKey)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('email');
          res.body.should.have.property('role');
          res.body.should.have.property('created');
          done();
        });
    });

    /**
    * Partially update the logged in user
    */
    it('should partially update the logged in user', function (done) {
      request(app)
        .patch('/users')
        .auth(personKey, personToken)
        .send({
          email: 'myperson@test.com',
          password: 'mypass'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('email');
          res.body.email.should.equal('myperson@test.com');
          done();
        });
    });

    /**
    * Partially update a user by ID
    */
    it('should partially update a user by ID', function (done) {
      request(app)
        .patch('/users/'+userKey)
        .auth(adminKey, adminToken)
        .send({
          role: 'staff'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('email');
          res.body.should.have.property('role');
          res.body.should.have.property('created');
          res.body.role.should.equal('staff');
          done();
        });
    });

    /**
    * Delete a user
    */
    it('should delete a user', function (done) {
      request(app)
        .delete('/users/'+userKey)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body._id.should.equal(userKey);
          done();
        });
    });

    /**
    * Delete another user
    */
    it('should delete the quickly created user', function (done) {
      request(app)
        .delete('/users/'+jdoeId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body._id.should.equal(jdoeId);
          done();
        });
    });

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