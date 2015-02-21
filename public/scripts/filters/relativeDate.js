angular
  .module('khe')
  .filter('relativeDate', function () {
    return function (input) {
      return moment(input).fromNow();
    };
  });