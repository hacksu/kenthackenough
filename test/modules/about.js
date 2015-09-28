'use strict';

/**
* Test the devices module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

  describe('About', function () {

    /**
    * create/update the about page
    */
    it('should create/update the about page', function (done) {
      request(app)
        .put('/v1.0/about')
        .auth(adminKey, adminToken)
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
        .get('/v1.0/about')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('text');
          res.body.should.have.property('updated');
          res.body.text.should.equal('# Hello World');
          done();
        });
    });

  });

};