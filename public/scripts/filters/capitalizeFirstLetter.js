angular
  .module('khe')
  .filter('capitalizeFirstLetter', function () {
    return function (input) {
      return input[0].toUpperCase() + input.slice(1);
    };
  });