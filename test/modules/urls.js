'use strict';

/**
* Test the url shortener module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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
        .expect(201)
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

  });

};