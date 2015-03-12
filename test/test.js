var app = require('../app').app;
var should = require('should');
var request = require('supertest');
var User = require('../app/modules/users/model');
var Email = require('../app/modules/emails/model');

describe('API', function () {

  // Create an admin user
  before(function (done) {
    var salt = User.Helpers.salt();
    var admin = new User({
      email: 'admin@test.com',
      role: User.ADMIN,
      password: User.Helpers.hash('pass', salt),
      salt: salt,
      activated: true
    });
    admin.save(function (err, user) {
      if (err) throw err;
      done();
    });
  });

  describe('User', function () {

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

  // describe('URL Shortener', function () {

  //   var linkId;

  //   it('should create a shortened url', function (done) {
  //     request(app)
  //       .post('/urls/shorten')
  //       .auth('admin@test.com', 'pass')
  //       .send({
  //         full: 'http://www.google.com',
  //         short: 'google'
  //       })
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.full.should.equal('http://www.google.com');
  //         res.body.short.should.equal('google');
  //         linkId = res.body._id;
  //         done();
  //       });
  //   });

  //   it('should redirect to the full url', function (done) {
  //     request(app)
  //       .get('/go/google')
  //       .expect(302)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         done();
  //       });
  //   });

  //   it('should list the created urls', function (done) {
  //     request(app)
  //       .get('/urls')
  //       .auth('admin@test.com', 'pass')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.urls.length.should.be.above(0);
  //         done();
  //       });
  //   });

  //   it('should delete the created url', function (done) {
  //     request(app)
  //       .post('/urls/remove')
  //       .auth('admin@test.com', 'pass')
  //       .send({
  //         id: linkId
  //       })
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         done();
  //       });
  //   });

  // });

  // describe('Emails', function () {

  //   it('should send an email to a test user', function (done) {
  //     request(app)
  //       .post('/emails/send')
  //       .auth('admin@test.com', 'pass')
  //       .send({
  //         nickname: 'Test Group',
  //         subject: 'Testing',
  //         body: '# Header',
  //         recipients: {
  //           emails: ['person@test.com']
  //         }
  //       })
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         JSON.stringify(res.body).should.equal('{}');
  //         done();
  //       });
  //   });

  //   it('should list all sent emails', function (done) {
  //     request(app)
  //       .get('/emails')
  //       .auth('admin@test.com', 'pass')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.emails.length.should.be.above(0);
  //         for (var i = 0; i < res.body.emails.length; i++) {
  //           if (res.body.emails[i].recipients.nickname == 'Test Group') {
  //             res.body.emails[i].subject.should.equal('Testing');
  //             res.body.emails[i].body.should.equal('# Header');
  //             break;
  //           }
  //         }
  //         done();
  //       });
  //   });

  // });

  // describe('Live Feed', function () {

  //   var messageId;

  //   it('should create a new message', function (done) {
  //     request(app)
  //       .post('/messages')
  //       .auth('admin@test.com', 'pass')
  //       .send({text: 'Hello, world'})
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.should.have.property('created');
  //         res.body.should.have.property('_id');
  //         res.body.text.should.equal('Hello, world');
  //         messageId = res.body._id;
  //         done();
  //       });
  //   });

  //   it('should get a list of messages', function (done) {
  //     request(app)
  //       .get('/messages')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.should.have.property('messages');
  //         res.body.messages.length.should.be.above(0);
  //         res.body.messages[0].should.have.property('created');
  //         res.body.messages[0].should.have.property('text');
  //         res.body.messages[0].should.have.property('_id');
  //         done();
  //       });
  //   });

  //   it('should get a single message', function (done) {
  //     request(app)
  //       .get('/messages/'+messageId)
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.should.have.property('created');
  //         res.body._id.should.equal(messageId);
  //         res.body.text.should.equal('Hello, world');
  //         done();
  //       });
  //   });

  //   it('should delete a message', function (done) {
  //     request(app)
  //       .delete('/messages/'+messageId)
  //       .auth('admin@test.com', 'pass')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         JSON.stringify(res.body).should.equal('{}');
  //         done();
  //       });
  //   });

  // });

  // describe('Tickets', function () {

  //   var ticketId;

  //   it('should create a new ticket', function (done) {
  //     request(app)
  //       .post('/tickets')
  //       .send({
  //         subject: 'Test Ticket',
  //         body: 'This is a test',
  //         replyTo: 'person@test.com'
  //       })
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.subject.should.equal('Test Ticket');
  //         res.body.body.should.equal('This is a test');
  //         res.body.replyTo.should.equal('person@test.com');
  //         res.body.open.should.equal(true);
  //         res.body.inProgress.should.equal(false);
  //         res.body.should.have.property('_id');
  //         res.body.should.have.property('created');
  //         ticketId = res.body._id;
  //         done();
  //       });
  //   });

  //   it('should get a list of tickets', function (done) {
  //     request(app)
  //       .get('/tickets')
  //       .auth('admin@test.com', 'pass')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.tickets.length.should.be.above(0);
  //         res.body.tickets[0].should.have.property('_id');
  //         res.body.tickets[0].should.have.property('created');
  //         res.body.tickets[0].should.have.property('subject');
  //         res.body.tickets[0].should.have.property('body');
  //         res.body.tickets[0].should.have.property('replyTo');
  //         res.body.tickets[0].should.have.property('open');
  //         res.body.tickets[0].should.have.property('inProgress');
  //         done();
  //       });
  //   });

  //   it('should get a single ticket by id', function (done) {
  //     request(app)
  //       .get('/tickets/'+ticketId)
  //       .auth('admin@test.com', 'pass')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.subject.should.equal('Test Ticket');
  //         res.body.body.should.equal('This is a test');
  //         res.body.replyTo.should.equal('person@test.com');
  //         res.body.open.should.equal(true);
  //         res.body.inProgress.should.equal(false);
  //         res.body.should.have.property('_id');
  //         res.body.should.have.property('created');
  //         done();
  //       });
  //   });

  //   it('should update a ticket', function (done) {
  //     request(app)
  //       .patch('/tickets/'+ticketId)
  //       .auth('admin@test.com', 'pass')
  //       .send({
  //         open: false,
  //         inProgress: true
  //       })
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         res.body.subject.should.equal('Test Ticket');
  //         res.body.body.should.equal('This is a test');
  //         res.body.replyTo.should.equal('person@test.com');
  //         res.body.open.should.equal(false);
  //         res.body.inProgress.should.equal(true);
  //         res.body.should.have.property('_id');
  //         res.body.should.have.property('created');
  //         done();
  //       });
  //   });

  //   it('should delete a ticket', function (done) {
  //     request(app)
  //       .delete('/tickets/'+ticketId)
  //       .auth('admin@test.com', 'pass')
  //       .expect(200)
  //       .end(function (err, res) {
  //         if (err) throw err;
  //         done();
  //       });
  //   });

  // });

  // Remove all test users
  after(function (done) {
    User.remove({email: 'admin@test.com'}, function (err) {
      if (err) throw err;
      done();
    });
  });

});