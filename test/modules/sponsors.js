'use strict';

/**
* Test the users and application modules
*/
var app = require('../../app').app;
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var Sponsor = require('../../app/sponsors/model');
var path = require('path');
var fs = require('fs');

module.exports = function (adminKey, adminToken) {
  var id = null;
  describe('Sponsors', function () {

  


    it('Should fail validation', function (done) {
      request(app)
        .post('/v1.0/sponsors')
        .auth(adminKey, adminToken)
        .send({})
        .expect(400)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });

    before(function (done) {
      Sponsor.remove({name: 'Hacksu industries'}, function (err) {
        if (err) throw err;
        done();
      });
    });

    it('Should add sponsor', function (done) {
      request(app)
        .post('/v1.0/sponsors')
        .auth(adminKey, adminToken)
        .send({name: 'Hacksu industries', link: 'http://hacksu.cs.kent.edu/', amount: 100})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          id = res.body._id;
          res.body.should.have.property('name');
          res.body.should.have.property('link');
          res.body.name.should.equal('Hacksu industries');
          res.body.link.should.equal('http://hacksu.cs.kent.edu/');
          done();
        });
    });

    it('Should list sponsors', function (done) {
      request(app)
        .get('/v1.0/sponsors')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.length.should.be.above(0);
          res.body[0].should.have.property('_id');
          res.body[0].should.have.property('name');
          res.body[0].should.have.property('link');
          done();
        });
    });

    it('Should fail validation to update a sponsor', function (done) {
      request(app)
        .post('/v1.0/sponsors/'+id)
        .auth(adminKey, adminToken)
        .send({nam: 'Hacksu industries', link: 'http://hacksu.cs.kent.edu/#test'})
        .expect(400)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });

    it('Should send 404 for non existing sponsors', function (done) {
      request(app)
        .post('/v1.0/sponsors/5a641e500000000000000000')
        .auth(adminKey, adminToken)
        .send({name: 'Hacksu industries', link: 'http://hacksu.cs.kent.edu/#test', amount: 100})
        .expect(404)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });

    it('Should update a sponsor', function (done) {
      request(app)
        .post('/v1.0/sponsors/'+id)
        .auth(adminKey, adminToken)
        .send({name: 'Hacksu industries', link: 'http://hacksu.cs.kent.edu/#test', amount: 100})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;

          done();
        });
    });

    it('Should get one sponsor', function (done) {
      request(app)
        .get('/v1.0/sponsors/'+id)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('link');
          res.body.name.should.equal('Hacksu industries');
          res.body.link.should.equal('http://hacksu.cs.kent.edu/#test');
          res.body._id.should.equal(id);
          done();
        });
    });

    it('Should upload a logo', function (done) {
      request(app)
        .post('/v1.0/sponsors/'+id+'/logo')
        .auth(adminKey, adminToken)
        .attach('file', __dirname + '/../test_files/logo.svg')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });

    it('Should download a logo', function (done) {
      request(app)
        .get('/v1.0/sponsors/'+id+'/logo')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.type.should.equal('image/svg+xml');
          done();
        });
    });

    it('Should delete a sponsor', function (done) {
      request(app)
        .delete('/v1.0/sponsors/'+id)
        .auth(adminKey, adminToken)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          done();
        });
    });
  });

};