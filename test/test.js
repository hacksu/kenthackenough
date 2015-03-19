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
          res.body.should.have.property('role');
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
          res.body.should.have.property('role');
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
          res.body.should.have.property('role');
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
        user.application.should.have.property('waiver');
        user.application.should.have.property('status');
        user.application.should.have.property('going');
        user.application.should.have.property('checked');
        user.application.should.have.property('created');
        user.application.should.have.property('door');
      }

      /**
      * Create an application
      */
      it('should create an application', function (done) {
        request(app)
          .post('/users/application')
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
            travel: false,
            waiver: true
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
          .get('/users/me/application')
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
          .get('/users/'+personKey+'/application')
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
          .get('/users/application')
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
          .patch('/users/me/application')
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
            travel: true,
            waiver: true
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
          .patch('/users/'+personKey+'/application')
          .auth(adminKey, adminToken)
          .send({
            status: 'accepted'
          })
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;
            assertApplication(res.body);
            res.body.application.status.should.equal('accepted');
            done();
          });
      });

      /**
      * Delete the logged in user's application
      */
      it('should delete the logged in user\'s application', function (done) {
        request(app)
          .delete('/users/me/application')
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
          .delete('/users/'+personKey+'/application')
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
        .post('/urls')
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
        .get('/urls/go/shortenedexample')
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
        .get('/urls/'+urlId)
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
        .get('/urls')
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
        .delete('/urls/'+urlId)
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
        .post('/emails')
        .auth(adminKey, adminToken)
        .send({
          subject: "Test Email",
          body: "This is an email from our API tests",
          recipients: {
            nickname: "Attendees",
            where: {
              role: "attendee"
            }
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
          res.body.recipients.should.have.property('where');
          res.body.recipients.where.should.have.property('role');
          res.body.recipients.where.role.should.equal('attendee');
          emailId = res.body._id;
          done();
        });
    });

    /**
    * Get a list of sent emails
    */
    it('should get a list of sent emails', function (done) {
      request(app)
        .get('/emails')
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
        .delete('/emails/'+emailId)
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
        .post('/messages')
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
        .get('/messages')
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
        .get('/messages/'+messageId)
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
        .patch('/messages/'+messageId)
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
        .delete('/messages/'+messageId)
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
        .post('/tickets')
        .send({
          subject: 'Test Ticket',
          body: 'This is a ticket from the tests',
          replyTo: 'test@test.com'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('subject');
          res.body.should.have.property('body');
          res.body.should.have.property('replyTo');
          res.body.should.have.property('open');
          res.body.should.have.property('inProgress');
          res.body.should.have.property('created');
          res.body.subject.should.equal('Test Ticket');
          res.body.body.should.equal('This is a ticket from the tests');
          res.body.replyTo.should.equal('test@test.com');
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
        .get('/tickets')
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
        .get('/tickets/'+ticketId)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('subject');
          res.body.should.have.property('body');
          res.body.should.have.property('replyTo');
          res.body.should.have.property('open');
          res.body.should.have.property('inProgress');
          res.body.should.have.property('created');
          res.body.subject.should.equal('Test Ticket');
          res.body.body.should.equal('This is a ticket from the tests');
          res.body.replyTo.should.equal('test@test.com');
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
        .patch('/tickets/'+ticketId)
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
          res.body.should.have.property('open');
          res.body.should.have.property('inProgress');
          res.body.should.have.property('created');
          res.body.subject.should.equal('Test Ticket');
          res.body.body.should.equal('This is a ticket from the tests');
          res.body.replyTo.should.equal('test@test.com');
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
        .delete('/tickets/'+ticketId)
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