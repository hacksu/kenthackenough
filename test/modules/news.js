'use strict';

/**
* Test the news list module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function (adminKey, adminToken) {

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
        .expect(201)
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

  });

};