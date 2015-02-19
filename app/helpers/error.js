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
    return res.send({errors: ['An internal error has ocurred.']});
  };
  res.singleError = function (message) {
    return res.send({errors: [message]});
  };
  res.multiError = function (messages) {
    return res.send({errors: messages});
  };
  next();
};