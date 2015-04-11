var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/projects');
var Project = require('./model');

/**
* Get a pair of projects to vote on
* GET /projects/pair
*/
router.get('/projects/pair', function (req, res) {
  Project
    .find()
    .exec(function (err, projects) {
      if (err) return res.internalError();
      var response = projects.slice(0, 2);
      return res.json({projects: response});
    });
});

/**
* Choose a winner from a pair
* PUT /projects/vote
*/
router.put('/projects/pair', function (req, res) {
  Project
    .find()
    .or([{_id: req.body.winner}, {_id: req.body.loser}])
    .exec(function (err, projects) {
      if (err) return res.internalError();
      var winner = (projects[0]._id == req.body.winner) ? projects[0] : projects[1];
      var loser = (projects[0]._id == req.body.loser) ? projects[0] : projects[1];

      var winnerExpected = Project.Elo.expected(winner.rating, loser.rating);
      var loserExpected = Project.Elo.expected(loser.rating, winner.rating);

      winner.rating = Project.Elo.rate(winnerExpected, winner.rating, true);
      loser.rating = Project.Elo.rate(loserExpected, loser.rating, false);

      winner.save(function (err, winner) {
        if (err) return res.internalError();
        loser.save(function (err, loser) {
          if (err) return res.internalError();
          return res.json({
            projects: [winner, loser]
          });
        });
      });
    });
});

/**
* Add a new project
* POST /projects
*/
router.post('/projects', function (req, res) {
  var errors = Project.validate(req.body);
  if (errors.length) return res.multiError(errors);

  var project = new Project(req.body);
  project.save(function (err, project) {
    if (err) return res.singleError('That project already exists');
    io.emit('create', project)
    return res.json(project);
  });
});

/**
* Get a project by ID
* GET /projects/:id
*/
router.get('/projects/:id', function (req, res) {
  Project
    .findById(req.params.id)
    .exec(function (err, project) {
      if (err) return res.internalError();
      return res.json(project);
    });
});

/**
* Get a list of projects
* GET /projects
*/
router.get('/projects', function (req, res) {
  Project
    .find()
    .exec(function (err, projects) {
      if (err) return res.internalError();
      return res.json({projects: projects});
    });
});

/**
* Update a project by ID
* PATCH /projects/:id
*/
router.patch('/projects/:id', function (req, res) {
  var errors = Project.validate(req.body);
  if (errors.length) return res.multiError(errors);

  Project
    .findByIdAndUpdate(req.params.id, req.body)
    .exec(function (err, project) {
      if (err) return res.singleError('That project already exists');
      io.emit('update', project);
      return res.json(project);
    });
});

/**
* Delete a project by ID
* DELETE /projects/:id
*/
router.delete('/projects/:id', function (req, res) {
  Project
    .findByIdAndRemove(req.params.id)
    .exec(function (err, project) {
      if (err) return res.internalError();
      var response = {
        _id: project._id
      };
      io.emit('delete', response);
      return res.json(response);
    });
});