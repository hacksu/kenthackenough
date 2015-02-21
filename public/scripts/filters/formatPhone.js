angular
  .module('khe')
  .filter('formatPhone', function () {
    return function (s) {
      var s2 = (""+s).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    };
  });