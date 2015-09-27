'use strict';

/**
* Test the projects module
*/
var app = require('../../app').app;
var should = require('should');
var request = require('supertest');

module.exports = function () {

  describe('Projects', function () {

    var projectA;
    var projectB;

    /**
    * Add a new project
    */
    it('should add a new project', function (done) {
      request(app)
        .post('/v1.0/projects')
        .send({
          name: 'Test-Project'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Test-Project');
          res.body.rating.should.equal(0);
          projectA = res.body._id;
          done();
        });
    });

    /**
    * Add a new project
    */
    it('should add another new project', function (done) {
      request(app)
        .post('/v1.0/projects')
        .send({
          name: 'Second-Test-Project'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Second-Test-Project');
          res.body.rating.should.equal(0);
          projectB = res.body._id;
          done();
        });
    });

    /**
    * Get a project by ID
    */
    it('should get a project by ID', function (done) {
      request(app)
        .get('/v1.0/projects/'+projectA)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Test-Project');
          res.body.rating.should.equal(0);
          done();
        });
    });

    /**
    * Get a list of projects
    */
    it('should get a list of projects', function (done) {
      request(app)
        .get('/v1.0/projects')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('projects');
          res.body.projects.length.should.be.above(0);
          res.body.projects[0].should.have.property('_id');
          res.body.projects[0].should.have.property('name');
          res.body.projects[0].should.have.property('rating');
          done();
        });
    });

    /**
    * Update a project by ID
    */
    it('should update a project by ID', function (done) {
      request(app)
        .patch('/v1.0/projects/'+projectA)
        .send({
          name: 'Test-Project-2'
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body.should.have.property('name');
          res.body.should.have.property('rating');
          res.body.name.should.equal('Test-Project-2');
          done();
        });
    });

    /**
    * Get a pair of projects to vote on
    */
    it('should get a pair of projects to vote on', function (done) {
      request(app)
        .get('/v1.0/projects/pair')
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('projects');
          res.body.projects.length.should.equal(2);
          res.body.projects[0].should.have.property('_id');
          res.body.projects[0].should.have.property('name');
          res.body.projects[0].should.have.property('rating');
          res.body.projects[1].should.have.property('_id');
          res.body.projects[1].should.have.property('name');
          res.body.projects[1].should.have.property('rating');
          done();
        });
    });

    /**
    * Choose a winner from a pair
    */
    it('should choose a winner from a pair', function (done) {
      request(app)
        .put('/v1.0/projects/pair')
        .send({
          winner: projectA,
          loser: projectB
        })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('projects');
          res.body.projects.length.should.equal(2);
          res.body.projects[0].should.have.property('_id');
          res.body.projects[0].should.have.property('name');
          res.body.projects[0].should.have.property('rating');
          res.body.projects[1].should.have.property('_id');
          res.body.projects[1].should.have.property('name');
          res.body.projects[1].should.have.property('rating');
          done();
        });
    });

    /**
    * Delete a project by ID
    */
    it('should delete a project by ID', function (done) {
      request(app)
        .delete('/v1.0/projects/'+projectA)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body._id.should.equal(projectA);
          done();
        });
    });

    /**
    * Delete a project by ID
    */
    it('should delete another project by ID', function (done) {
      request(app)
        .delete('/v1.0/projects/'+projectB)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          res.body.should.have.property('_id');
          res.body._id.should.equal(projectB);
          done();
        });
    });

  });

};