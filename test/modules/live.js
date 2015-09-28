'use strict';

/**
* Test the live feed module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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
        .expect(201)
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

  });

};