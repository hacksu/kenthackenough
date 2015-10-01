'use strict';

/**
* Test the devices module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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

    /**
    * get the number of applications that are marked probable
    */
    it('should get the number of applications that are marked probable', function (done) {
      request(app)
        .get('/v1.0/stats/count?probable=true')
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('count');
          done();
        });
    });

  });

};