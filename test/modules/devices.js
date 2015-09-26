'use strict';
/**
* Test the devices module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function () {

  describe('Devices', function () {

    /**
    * Register a new device
    */
    it('should register a new device', function (done) {
      request(app)
        .post('/v1.0/devices')
        .expect(200)
        .send({
          type: 'android',
          id: 'abcdef'
        })
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('id');
          res.body.id.should.equal('abcdef');
          done();
        });
    });

    /**
    * Unregister a device
    */
    it('should unregister a device', function (done) {
      request(app)
        .delete('/v1.0/devices/abcdef')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          done();
        });
    });

  });

};