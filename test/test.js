var app = require('../app').app;
var should = require('should');
var request = require('supertest');
var User = require('../app/users/model');

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
        .post('/v1.0/users')
        .send({
          client: 'mocha',
          email: 'user@test.com',
          password: 'pass'
        })
        .expect(200)
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
        .expect(200)
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
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('key');
          res.body.should.have.property('token');
          res.body.should.have.property('role');
          res.body.should.have.property('refresh');
          res.body.should.have.property('expires');
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
        .post('/v1.0/users/quick')
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
          .expect(200)
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
      * Search for applications
      */
      it('should return at least one search result', function (done) {
        request(app)
          .get('/v1.0/users/application/search?q=state')
          .auth(adminKey, adminToken)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            res.body.should.have.property('results');
            res.body.results.length.should.be.above(0);
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

  describe('URL Shortener', function () {

    var urlId;

    /**
    * Create a new shortened URL
    */
    it('should create a new shortened URL', function (done) {
      request(app)
        .post('/v1.0/urls')
        .auth(adminKey, adminToken)
        .send({
          full: 'http://example.com',
          short: 'shortenedexample'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('full');
          res.body.should.have.property('short');
          res.body.full.should.equal('http://example.com');
          res.body.short.should.equal('shortenedexample');
          urlId = res.body._id;
          done();
        });
    });

    /**
    * Resolve a shortened URL
    */
    it('should resolve a shortened URL', function (done) {
      request(app)
        .get('/v1.0/urls/go/shortenedexample')
        .expect(302)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });

    /**
    * Get a single URL
    */
    it('should get a single URL', function (done) {
      request(app)
        .get('/v1.0/urls/'+urlId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('full');
          res.body.should.have.property('short');
          res.body.full.should.equal('http://example.com');
          res.body.short.should.equal('shortenedexample');
          done();
        });
    });

    /**
    * Get a list of URLs
    */
    it('should get a list of URLs', function (done) {
      request(app)
        .get('/v1.0/urls')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('urls');
          res.body.urls.length.should.be.above(0);
          res.body.urls[0].should.have.property('_id');
          res.body.urls[0].should.have.property('full');
          res.body.urls[0].should.have.property('short');
          done();
        });
    });

    /**
    * Delete a URL
    */
    it('should delete a URL', function (done) {
      request(app)
        .delete('/v1.0/urls/'+urlId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          done();
        })
    });

  }); // end URL Shortener

  describe('Emails', function () {

    var emailId;

    /**
    * Create a new email and send it
    */
    it('should create a new email and send it', function (done) {
      request(app)
        .post('/v1.0/emails')
        .auth(adminKey, adminToken)
        .send({
          subject: "Test Email",
          body: "This is an email from our API tests",
          recipients: {
            nickname: "Attendees",
            emails: ["test@test.com"]
          }
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('subject');
          res.body.should.have.property('body');
          res.body.should.have.property('recipients');
          res.body.recipients.should.have.property('nickname');
          res.body.recipients.should.have.property('emails');
          res.body.recipients.emails[0].should.equal('test@test.com');
          emailId = res.body._id;
          done();
        });
    });

    /**
    * Get a list of sent emails
    */
    it('should get a list of sent emails', function (done) {
      request(app)
        .get('/v1.0/emails')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('emails');
          res.body.emails.length.should.be.above(0);
          res.body.emails[0].should.have.property('_id');
          res.body.emails[0].should.have.property('subject');
          res.body.emails[0].should.have.property('sent');
          res.body.emails[0].should.have.property('body');
          res.body.emails[0].should.have.property('recipients');
          done();
        });
    });

    /**
    * Delete a sent email
    */
    it('should delete a sent email', function (done) {
      request(app)
        .delete('/v1.0/emails/'+emailId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body._id.should.equal(emailId);
          done();
        });
    });

  }); // end Emails

  describe('Live Feed', function () {

    var messageId;

    /**
    * Create a new message
    */
    it('should create a new message', function (done) {
      request(app)
        .post('/v1.0/messages')
        .auth(adminKey, adminToken)
        .send({
          text: 'Test message'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('created');
          res.body.should.have.property('text');
          res.body.text.should.equal('Test message');
          messageId = res.body._id;
          done();
        });
    });

    /**
    * Get a list of messages
    */
    it('should get a list of messages', function (done) {
      request(app)
        .get('/v1.0/messages')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('messages');
          res.body.messages.length.should.be.above(0);
          res.body.messages[0].should.have.property('_id');
          res.body.messages[0].should.have.property('created');
          res.body.messages[0].should.have.property('text');
          done();
        });
    });

    /**
    * Get a single message
    */
    it('should get a single message', function (done) {
      request(app)
        .get('/v1.0/messages/'+messageId)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('created');
          res.body.should.have.property('text');
          res.body.text.should.equal('Test message');
          done();
        });
    });

    /**
    * Update a message
    */
    it('should update a message', function (done) {
      request(app)
        .patch('/v1.0/messages/'+messageId)
        .auth(adminKey, adminToken)
        .send({
          text: 'Oops we had to change it'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('created');
          res.body.should.have.property('text');
          res.body.text.should.equal('Oops we had to change it');
          done();
        });
    });

    /**
    * Delete a message
    */
    it('should delete a message', function (done) {
      request(app)
        .delete('/v1.0/messages/'+messageId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body._id.should.equal(messageId);
          done();
        });
    });

  }); // end Live Feed

  describe('Tickets', function () {

    var ticketId;

    /**
    * Create a new ticket
    */
    it('should create a new ticket', function (done) {
      request(app)
        .post('/v1.0/tickets')
        .send({
          subject: 'Test Ticket',
          body: 'This is a ticket from the tests',
          replyTo: 'test@test.com',
          name: 'Test Person'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('subject');
          res.body.should.have.property('body');
          res.body.should.have.property('replyTo');
          res.body.should.have.property('name');
          res.body.should.have.property('open');
          res.body.should.have.property('inProgress');
          res.body.should.have.property('created');
          res.body.subject.should.equal('Test Ticket');
          res.body.body.should.equal('This is a ticket from the tests');
          res.body.replyTo.should.equal('test@test.com');
          res.body.name.should.equal('Test Person');
          res.body.open.should.equal(true);
          res.body.inProgress.should.equal(false);
          ticketId = res.body._id;
          done();
        });
    });

    /**
    * Get a list of tickets
    */
    it('should get a list of tickets', function (done) {
      request(app)
        .get('/v1.0/tickets')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('tickets');
          res.body.tickets.length.should.be.above(0);
          res.body.tickets[0].should.have.property('_id');
          res.body.tickets[0].should.have.property('subject');
          res.body.tickets[0].should.have.property('body');
          res.body.tickets[0].should.have.property('replyTo');
          res.body.tickets[0].should.have.property('open');
          res.body.tickets[0].should.have.property('inProgress');
          res.body.tickets[0].should.have.property('created');
          done();
        });
    });

    /**
    * Get a ticket by ID
    */
    it('should get a ticket by ID', function (done) {
      request(app)
        .get('/v1.0/tickets/'+ticketId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('subject');
          res.body.should.have.property('body');
          res.body.should.have.property('replyTo');
          res.body.should.have.property('name');
          res.body.should.have.property('open');
          res.body.should.have.property('inProgress');
          res.body.should.have.property('created');
          res.body.subject.should.equal('Test Ticket');
          res.body.body.should.equal('This is a ticket from the tests');
          res.body.replyTo.should.equal('test@test.com');
          res.body.name.should.equal('Test Person');
          res.body.open.should.equal(true);
          res.body.inProgress.should.equal(false);
          done();
        });
    });

    /**
    * Partially update a ticket
    */
    it('should partially update a ticket', function (done) {
      request(app)
        .patch('/v1.0/tickets/'+ticketId)
        .auth(adminKey, adminToken)
        .send({
          open: false
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('subject');
          res.body.should.have.property('body');
          res.body.should.have.property('replyTo');
          res.body.should.have.property('name');
          res.body.should.have.property('open');
          res.body.should.have.property('worker');
          res.body.should.have.property('inProgress');
          res.body.should.have.property('created');
          res.body.subject.should.equal('Test Ticket');
          res.body.body.should.equal('This is a ticket from the tests');
          res.body.replyTo.should.equal('test@test.com');
          res.body.name.should.equal('Test Person');
          res.body.open.should.equal(false);
          res.body.inProgress.should.equal(false);
          done();
        });
    });

    /**
    * Delete a ticket
    */
    it('should delete a ticket', function (done) {
      request(app)
        .delete('/v1.0/tickets/'+ticketId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body._id.should.equal(ticketId);
          done();
        });
    });

  }); // end Tickets

  describe('News List', function () {

    var newsId;

    /**
    * Add an email to the list
    */
    it('should add an email to the list', function (done) {
      request(app)
        .post('/v1.0/news')
        .send({
          email: 'test@test.com'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('email');
          res.body.should.have.property('created');
          res.body.email.should.equal('test@test.com');
          newsId = res.body._id;
          done();
        });
    });

    /**
    * Get a single email from the list
    */
    it('should get a single email from the list', function (done) {
      request(app)
        .get('/v1.0/news/' + newsId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('email');
          res.body.should.have.property('created');
          res.body.email.should.equal('test@test.com');
          done();
        });
    });

    /**
    * Get a list of emails on the list
    */
    it('should get a list of emails on the news list', function (done) {
      request(app)
        .get('/v1.0/news')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('news');
          res.body.news.length.should.be.above(0);
          res.body.news[0].should.have.property('_id');
          res.body.news[0].should.have.property('email');
          res.body.news[0].should.have.property('created');
          done();
        });
    });

    /**
    * Delete an email from the list
    */
    it('should delete an email from the list', function (done) {
      request(app)
        .delete('/v1.0/news/' + newsId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          done();
        });
    });

  }); // end News List

  describe('Events', function () {

    var eventId;

    /**
    * Add a new event
    */
    it('should add a new event', function (done) {
      request(app)
        .post('/v1.0/events')
        .auth(adminKey, adminToken)
        .send({
          title: 'Test Event',
          description: 'Test Event description',
          start: new Date(2015, 1, 1, 10, 30),
          end: new Date(2015, 1, 1, 11, 0),
          type: 'Food',
          icon: 'http://google.com',
          location: 'Library',
          group: 'staff',
          notify: true
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('title');
          res.body.should.have.property('description');
          res.body.should.have.property('start');
          res.body.should.have.property('end');
          res.body.should.have.property('type');
          res.body.should.have.property('icon');
          res.body.should.have.property('location');
          res.body.should.have.property('group');
          res.body.should.have.property('notify');
          res.body.title.should.equal('Test Event');
          res.body.description.should.equal('Test Event description');
          res.body.type.should.equal('Food');
          res.body.icon.should.equal('http://google.com');
          res.body.location.should.equal('Library');
          res.body.group.should.equal('staff');
          res.body.notify.should.equal(true);
          eventId = res.body._id;
          done();
        });
    });

    /**
    * Get an event by ID
    */
    it('should get an event by ID', function (done) {
      request(app)
        .get('/v1.0/events/'+eventId)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('title');
          res.body.should.have.property('description');
          res.body.should.have.property('start');
          res.body.should.have.property('end');
          res.body.should.have.property('type');
          res.body.should.have.property('icon');
          res.body.should.have.property('location');
          res.body.should.have.property('group');
          res.body.should.have.property('notify');
          res.body.title.should.equal('Test Event');
          res.body.description.should.equal('Test Event description');
          res.body.type.should.equal('Food');
          res.body.icon.should.equal('http://google.com');
          res.body.location.should.equal('Library');
          res.body.group.should.equal('staff');
          res.body.notify.should.equal(true);
          done();
        });
    });

    /**
    * Get a list of events
    */
    it('should get a list of events', function (done) {
      request(app)
        .get('/v1.0/events')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('events');
          res.body.events.length.should.be.above(0);
          res.body.events[0].should.have.property('_id');
          res.body.events[0].should.have.property('title');
          res.body.events[0].should.have.property('group');
          res.body.events[0].should.have.property('notify');
          done();
        });
    });

    /**
    * Partially update an event
    */
    it('should partially update event', function (done) {
      request(app)
        .patch('/v1.0/events/'+eventId)
        .auth(adminKey, adminToken)
        .send({
          title: 'Hello World Test Event'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('title');
          res.body.should.have.property('description');
          res.body.should.have.property('start');
          res.body.should.have.property('end');
          res.body.should.have.property('type');
          res.body.should.have.property('icon');
          res.body.should.have.property('location');
          res.body.should.have.property('group');
          res.body.should.have.property('notify');
          res.body.title.should.equal('Hello World Test Event');
          res.body.description.should.equal('Test Event description');
          res.body.type.should.equal('Food');
          res.body.icon.should.equal('http://google.com');
          res.body.location.should.equal('Library');
          res.body.group.should.equal('staff');
          res.body.notify.should.equal(true);
          done();
        });
    });

    /**
    * Delete an event
    */
    it('should delete an event', function (done) {
      request(app)
        .delete('/v1.0/events/'+eventId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          done();
        });
    });

  }); // end Events

  describe('Projects', function () {

    var projectA;
    var projectB;

    /**
    * Add a new project
    */
    it('should add a new project', function (done) {
      request(app)
        .post('/v1.0/projects')
        .send({
          name: 'Test-Project'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Test-Project');
          res.body.rating.should.equal(0);
          projectA = res.body._id;
          done();
        });
    });

    /**
    * Add a new project
    */
    it('should add another new project', function (done) {
      request(app)
        .post('/v1.0/projects')
        .send({
          name: 'Second-Test-Project'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Second-Test-Project');
          res.body.rating.should.equal(0);
          projectB = res.body._id;
          done();
        });
    });

    /**
    * Get a project by ID
    */
    it('should get a project by ID', function (done) {
      request(app)
        .get('/v1.0/projects/'+projectA)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Test-Project');
          res.body.rating.should.equal(0);
          done();
        });
    });

    /**
    * Get a list of projects
    */
    it('should get a list of projects', function (done) {
      request(app)
        .get('/v1.0/projects')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('projects');
          res.body.projects.length.should.be.above(0);
          res.body.projects[0].should.have.property('_id');
          res.body.projects[0].should.have.property('name');
          res.body.projects[0].should.have.property('rating');
          done();
        });
    });

    /**
    * Update a project by ID
    */
    it('should update a project by ID', function (done) {
      request(app)
        .patch('/v1.0/projects/'+projectA)
        .send({
          name: 'Test-Project-2'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Test-Project-2');
          done();
        });
    });

    /**
    * Get a pair of projects to vote on
    */
    it('should get a pair of projects to vote on', function (done) {
      request(app)
        .get('/v1.0/projects/pair')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('projects');
          res.body.projects.length.should.equal(2);
          res.body.projects[0].should.have.property('_id');
          res.body.projects[0].should.have.property('name');
          res.body.projects[0].should.have.property('rating');
          res.body.projects[1].should.have.property('_id');
          res.body.projects[1].should.have.property('name');
          res.body.projects[1].should.have.property('rating');
          done();
        });
    });

    /**
    * Choose a winner from a pair
    */
    it('should choose a winner from a pair', function (done) {
      request(app)
        .put('/v1.0/projects/pair')
        .send({
          winner: projectA,
          loser: projectB
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('projects');
          res.body.projects.length.should.equal(2);
          res.body.projects[0].should.have.property('_id');
          res.body.projects[0].should.have.property('name');
          res.body.projects[0].should.have.property('rating');
          res.body.projects[1].should.have.property('_id');
          res.body.projects[1].should.have.property('name');
          res.body.projects[1].should.have.property('rating');
          done();
        });
    });

    /**
    * Delete a project by ID
    */
    it('should delete a project by ID', function (done) {
      request(app)
        .delete('/v1.0/projects/'+projectA)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body._id.should.equal(projectA);
          done();
        });
    });

    /**
    * Delete a project by ID
    */
    it('should delete another project by ID', function (done) {
      request(app)
        .delete('/v1.0/projects/'+projectB)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body._id.should.equal(projectB);
          done();
        });
    });

  }); // end Projects

  describe('Statistics', function () {

    /**
    * Get registrations over time for all applications
    */
    it('should build a graph of registrations over time for all applied users', function (done) {
      request(app)
        .get('/v1.0/stats/registrations')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('months');
          done();
        });
    });

    /**
    * Get registrations over time for probable attendees
    */
    it('should build a graph of registrations over time for probable attendees', function (done) {
      request(app)
        .get('/v1.0/stats/registrations?probable=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('months');
          done();
        });
    });

    /**
    * Get registrations over time for RSVPd attendees
    */
    it('should build a graph of registrations over time for RSVPd attendees', function (done) {
      request(app)
        .get('/v1.0/stats/registrations?going=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('months');
          done();
        });
    });

    /**
    * Get registrations over time for checked-in attendees
    */
    it('should build a graph of registrations over time for checked-in attendees', function (done) {
      request(app)
        .get('/v1.0/stats/registrations?checked=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('months');
          done();
        });
    });

    /**
    * Get shirt sizes
    */
    it('should get the distribution of t-shirt sizes', function (done) {
      request(app)
        .get('/v1.0/stats/shirts')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('small');
          res.body.should.have.property('medium');
          res.body.should.have.property('large');
          res.body.should.have.property('xlarge');
          done();
        });
    });

    /**
    * Get shirt sizes for checked-in attendees
    */
    it('should get the distribution of t-shirt sizes for checked-in attendees', function (done) {
      request(app)
        .get('/v1.0/stats/shirts?checked=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('small');
          res.body.should.have.property('medium');
          res.body.should.have.property('large');
          res.body.should.have.property('xlarge');
          done();
        });
    });

    /**
    * Get a distribution of dietary restrictions
    */
    it('should get the distribution of dietary restrictions', function (done) {
      request(app)
        .get('/v1.0/stats/dietary')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.not.equal(null);
          done();
        });
    });

    /**
    * Get a distribution of dietary restrictions for checked-in attendees
    */
    it('should get the distribution of dietary restrictions for checked-in attendees', function (done) {
      request(app)
        .get('/v1.0/stats/dietary?checked=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.not.equal(null);
          done();
        });
    });

    /**
    * Gender comparison
    */
    it('should get a gender comparison', function (done) {
      request(app)
        .get('/v1.0/stats/gender')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('male');
          res.body.should.have.property('female');
          res.body.should.have.property('other');
          done();
        });
    });

    /**
    * Gender comparison of checked-in attendees
    */
    it('should get a gender comparison of checked-in attendees', function (done) {
      request(app)
        .get('/v1.0/stats/gender?checked=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('male');
          res.body.should.have.property('female');
          res.body.should.have.property('other');
          done();
        });
    });

    /**
    * Get a distribution of schools
    */
    it('should get a distribution of schools', function (done) {
      request(app)
        .get('/v1.0/stats/schools')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('schools');
          res.body.schools.should.not.equal(null);
          done();
        });
    });

    /**
    * Get a distribution of schools for checked-in attendees
    */
    it('should get a distribution of schools for checked-in attendees', function (done) {
      request(app)
        .get('/v1.0/stats/schools?checked=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('schools');
          res.body.schools.should.not.equal(null);
          done();
        });
    });

  }); // end Statistics

  describe('About', function () {

    /**
    * create/update the about page
    */
    it('should create/update the about page', function (done) {
      request(app)
        .put('/about')
        .send({
          text: '# Hello World'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('text');
          res.body.should.have.property('updated');
          res.body.text.should.equal('# Hello World');
          done();
        });
    });

    /**
    * get the about page
    */
    it('should get the about page', function (done) {
      request(app)
        .get('/about')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('text');
          res.body.should.have.property('updated');
          res.body.text.should.equal('# Hello World');
          done();
        });
    });

  }); // end About

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