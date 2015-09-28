'use strict';

/**
* Test the events module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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
        .expect(201)
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

  });

};