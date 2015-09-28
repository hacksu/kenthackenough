'use strict';

/**
* Test the users and application modules
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');
var User = require('../../app/users/model');

module.exports = function (callback/*admin*/) {

  var personKey;
  var personToken;
  var adminKey;
  var adminToken;
  var userKey;
  var userToken;
  var userRefresh;
  var jdoeId;

  describe('Users', function () {

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

    /**
    * Create a new user
    */
    it('should create a new user', function (done) {
      request(app)
        .post('/v1.0/users')
        .send({
          client: 'mocha',
          email: 'user@test.com',
          password: 'pass'
        })
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          res.body.should.have.property('role');
          res.body.should.have.property('refresh');
          res.body.should.have.property('expires');
          userKey = res.body.key;
          userToken = res.body.token;
          userRefresh = res.body.refresh;
          done();
        });
    });

    /**
    * Get a key and token
    */
    it('should get a key and token', function (done) {
      request(app)
        .post('/v1.0/users/token')
        .send({
          client: 'mocha',
          email: 'person@test.com',
          password: 'pass'
        })
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          res.body.should.have.property('role');
          res.body.should.have.property('refresh');
          res.body.should.have.property('expires');
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
        .post('/v1.0/users/token')
        .send({
          client: 'mocha',
          email: 'admin@test.com',
          password: 'pass'
        })
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          res.body.should.have.property('role');
          res.body.should.have.property('refresh');
          res.body.should.have.property('expires');
          adminKey = res.body.key;
          adminToken = res.body.token;
          callback({key: adminKey, token: adminToken});
          done();
        });
    });

    /**
    * Quickly create a fully applied user (for registering at the door)
    */
    it('should quickly create a fully applied user', function (done) {
      request(app)
        .post('/v1.0/users/quick')
        .auth(adminKey, adminToken)
        .send({
          name: 'John Doe',
          email: 'jdoe@test.com',
          phone: '5555555555'
        })
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('email');
          res.body.should.have.property('role');
          res.body.should.have.property('created');
          res.body.should.have.property('application');
          res.body.application.should.have.property('name');
          res.body.application.should.have.property('phone');
          res.body.email.should.equal('jdoe@test.com');
          res.body.application.name.should.equal('John Doe');
          res.body.application.phone.should.equal('5555555555');
          jdoeId = res.body._id;
          done();
        });
    });

    /**
    * Refresh a token
    */
    it('should refresh a token', function (done) {
      request(app)
        .post('/v1.0/users/token/refresh')
        .send({
          client: 'mocha',
          key: userKey,
          refresh: userRefresh
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('role');
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          res.body.should.have.property('refresh');
          res.body.should.have.property('expires');
          userKey = res.body.key;
          userToken = res.body.token;
          userRefresh = res.body.refresh;
          done();
        });
    });

    /**
    * Remove a token
    */
    it('should remove a token', function (done) {
      request(app)
        .delete('/v1.0/users/token')
        .send({
          client: 'mocha'
        })
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
        .get('/v1.0/users')
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
        .get('/v1.0/users/'+userKey)
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
        .patch('/v1.0/users')
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
        .patch('/v1.0/users/'+userKey)
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
        .delete('/v1.0/users/'+userKey)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body._id.should.equal(userKey);
          done();
        });
    });

    /**
    * Delete the quickly created user's application
    */
    it('should delete the quickly created user\'s application by ID', function (done) {
      request(app)
        .delete('/v1.0/users/'+jdoeId+'/application')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          done();
        });
    });

    /**
    * Delete another user
    */
    it('should delete the quickly created user', function (done) {
      request(app)
        .delete('/v1.0/users/'+jdoeId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body._id.should.equal(jdoeId);
          done();
        });
    });

    // Test users/application
    describe('Application', function () {

      function assertApplication(user) {
        user.should.have.property('_id');
        user.should.have.property('email');
        user.should.have.property('role');
        user.should.have.property('created');
        user.should.have.property('application');
        user.application.should.have.property('name');
        user.application.should.have.property('school');
        user.application.should.have.property('phone');
        user.application.should.have.property('shirt');
        user.application.should.have.property('demographic');
        user.application.should.have.property('first');
        user.application.should.have.property('dietary');
        user.application.should.have.property('year');
        user.application.should.have.property('age');
        user.application.should.have.property('gender');
        user.application.should.have.property('major');
        user.application.should.have.property('conduct');
        user.application.should.have.property('travel');
        user.application.should.have.property('status');
        user.application.should.have.property('going');
        user.application.should.have.property('checked');
        user.application.should.have.property('created');
        user.application.should.have.property('door');
        user.application.should.have.property('probable');
      }

      /**
      * Create an application
      */
      it('should create an application', function (done) {
        request(app)
          .post('/v1.0/users/application')
          .auth(personKey, personToken)
          .send({
            name: 'Person Guy',
            school: 'State University',
            phone: '5555555555',
            shirt: 'XL',
            demographic: true,
            first: true,
            dietary: 'Vegan|Vegetarian',
            year: 'Senior',
            age: 21,
            gender: 'Male',
            major: 'Basket Weaving',
            conduct: true,
            travel: false
          })
          .expect(201)
          .end(function (err, res) {
            if (err) throw err;
            assertApplication(res.body);
            res.body.application.name.should.equal('Person Guy');
            res.body.application.school.should.equal('State University');
            res.body.application.phone.should.equal('5555555555');
            res.body.application.shirt.should.equal('XL');
            res.body.application.demographic.should.equal(true);
            res.body.application.status.should.equal('pending');
            res.body.application.going.should.equal(false);
            done();
          });
      });

      /**
      * Get the logged in user with their application
      */
      it('should get the logged in user with their application', function (done) {
        request(app)
          .get('/v1.0/users/me/application')
          .auth(personKey, personToken)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            assertApplication(res.body);
            res.body.application.name.should.equal('Person Guy');
            done();
          });
      });

      /**
      * Get a user by ID with their application
      */
      it('should get a user by ID with their application', function (done) {
        request(app)
          .get('/v1.0/users/'+personKey+'/application')
          .auth(adminKey, adminToken)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            assertApplication(res.body);
            res.body.application.name.should.equal('Person Guy');
            done();
          });
      });

      /**
      * Get a list of users with their applications
      */
      it('should get a list of users with their applications', function (done) {
        request(app)
          .get('/v1.0/users/application')
          .auth(adminKey, adminToken)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.users.length.should.be.above(0);
            done();
          });
      });

      /**
      * Partially update the logged in user's application
      */
      it('should partially update the logged in user\'s application', function (done) {
        request(app)
          .patch('/v1.0/users/me/application')
          .auth(personKey, personToken)
          .send({
            name: 'Guy Person',
            school: 'State College',
            phone: '1234567890',
            shirt: 'L',
            demographic: true,
            first: true,
            year: 'Junior',
            age: 20,
            gender: 'Male',
            major: 'Basket Weaving',
            conduct: true,
            travel: true
          })
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            assertApplication(res.body);
            res.body.application.name.should.equal('Guy Person');
            res.body.application.school.should.equal('State College');
            res.body.application.age.should.equal(20);
            done();
          });
      });

      /**
      * Partially update a user's application by ID
      */
      it('should partially update a user\'s application by ID', function (done) {
        request(app)
          .patch('/v1.0/users/'+personKey+'/application')
          .auth(adminKey, adminToken)
          .send({
            status: 'accepted',
            probable: true
          })
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            assertApplication(res.body);
            res.body.application.status.should.equal('accepted');
            res.body.application.probable.should.equal(true);
            done();
          });
      });

      /**
      * Delete the logged in user's application
      */
      it('should delete the logged in user\'s application', function (done) {
        request(app)
          .delete('/v1.0/users/me/application')
          .auth(personKey, personToken)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.have.property('_id');
            done();
          });
      });

      /**
      * Delete a user's application by ID
      */
      it('should delete a user\'s application by ID', function (done) {
        request(app)
          .delete('/v1.0/users/'+personKey+'/application')
          .auth(adminKey, adminToken)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.have.property('_id');
            done();
          });
      });

    }); // end application

  }); // end User

};