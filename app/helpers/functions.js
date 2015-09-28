'use strict';

module.exports = {

  capitalizeFirstLetter: function (str) {
    if (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return '';
  }

};