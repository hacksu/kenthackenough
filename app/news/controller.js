var router = getRouter();
var socket = rootRequire('app/helpers/socket');
var io = socket('/news', ['admin', 'staff']);
var News = require('./model');
var User = rootRequire('app/users/model');

/**
* Add an email to the list
* POST /news
*/
router.post('/news', function (req, res) {
  var errors = News.validate(req.body);
  if (errors.length) return res.multiError(errors);
  req.body.created = Date.now();
  var news = new News(req.body);
  news.save(function (err, news) {
    if (err) return res.singleError('That email is already on the list');
    io.emit('create', news);
    return res.json(news);
  });
});

/**
* Get a single email from the list
* GET /news/:id
* Auth -> admin, staff
*/
router.get('/news/:id', User.auth('admin', 'staff'), function (req, res) {
  News
    .findById(req.params.id)
    .exec(function (err, item) {
      if (err) return res.internalError();
      return res.json(item);
    });
});

/**
* Get a list of emails from the list
* GET /news
* Auth -> admin, staff
*/
router.get('/news', User.auth('admin', 'staff'), function (req, res) {
  News
    .find()
    .exec(function (err, items) {
      if (err) return res.internalError();
      return res.json({news: items});
    });
});

/**
* Delete an email from the list
* DELETE /news/:id
* Auth -> admin, staff
*/
router.delete('/news/:id', User.auth('admin', 'staff'), function (req, res) {
  News
    .findByIdAndRemove(req.params.id)
    .select('_id')
    .exec(function (err, item) {
      if (err) return res.internalError();
      io.emit('delete', item);
      return res.json(item);
    });
});