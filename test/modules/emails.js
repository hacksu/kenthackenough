'use strict';

/**
* Test the emails module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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
        .expect(201)
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

  });

};