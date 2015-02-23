angular
  .module('khe')
  .filter('markdown', function () {
    return function (input) {
      return marked(input);
    };
  });