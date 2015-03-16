var app = require('../app').app;
var should = require('should');
var request = require('supertest');
var User = require('../app/modules/users/model');

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

  describe('Users', function () {

    var userId;

    /**
    * Create a new user
    */
    it('should create a new user', function (done) {
      request(app)
        .post('/users')
        .send({
          email: 'person@test.com',
          password: 'test'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          userId = res.body.key;
          done();
        });
    });

    /**
    * Quickly create a fully applied user (for registering at the door)
    */
    it('should quickly create a fully applied user', function (done) {
      request(app)
        .post('/users/quick')
        .send({
          name: 'John Doe',
          email: 'jdoe@test.com'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.
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
          password: 'test'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          done();
        });
    });

    /**
    * Get a list of all users
    */
    it('should get a list of all users', function (done) {
      request(app)
        .get('/users')
        .auth('admin@test.com', 'test')
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
        .get('/users/'+userId)
        .auth('admin@test.com', 'test')
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
    * Update a user by ID
    */
    it('should update a user by ID', function (done) {
      request(app)
        .put('/users/'+userId)
        .auth('admin@test.com', 'test')
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
        .delete('/users/'+userId)
        .auth('admin@test.com', 'test')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
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

});