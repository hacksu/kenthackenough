/**
* A few simple error handlers placed in the response object when used
* as a middleware.
*
* Usage:
*   res.internalError();
*   res.singleError('My error message');
*   res.multiError(['One', 'Two', 'Three']);
*/

module.exports = function (req, res, next) {
  res.internalError = function () {
    res
      .status(500)
      .send({errors: ['An internal error has ocurred.']});
  };
  res.singleError = function (message) {
    res
      .status(500)
      .send({errors: [message]});
  };
  res.multiError = function (messages) {
    res
      .status(500)
      .send({errors: messages});
  };
  next();
};