'use strict';

/**
* Test the tickets module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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
        .expect(201)
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

  });

};