var mongoose = require('mongoose');
var schema = require('validate');

var Project = mongoose.model('Project', {
  name: {type: String, unique: true},
  created: {type: Date, default: new Date()},
  rating: {type: Number, default: 0}
});

var validate = function (project) {
 var test = schema({
  name: {
    required: true,
    type: 'string',
    message: 'A project name is required'
  }
 }, {typecast: true});
 return test.validate(project);
};

/**
* An implementation of the Elo ranking system
*/
var Elo = {

  /**
  * The K-factor
  */
  k: 32,

  /**
  * Get the expected score for a given player against an opponent
  * @param a The actual score of one player
  * @param b The actual score of another player
  * @return The expected score for the first player
  *
  * Example:
  * playerA_expected = Elo.expected(playerA_actual, playerB_actual);
  * playerB_expected = Elo.expected(playerB_actual, playerA_actual);
  */
  expected: function (a, b) {
    var exponent = (b - a) / 400;
    var numerator = 1;
    var denominator = 1 + Math.pow(10, exponent);
    return numerator / denominator;
  },

  /**
  * Update the rating for a given player
  * @param expected The expected score for a player
  * @param current The actual score for that player
  * @param won True if the player won, false if they lost
  * @return The new score for the player
  *
  * Example, if playerA wins:
  * playerA_new = Elo.rate(playerA_expected, playerA_actual, true);
  * playerB_new = Elo.rate(playerB_expected, playerB_actual, false);
  */
  rate: function (expected, current, won) {
    var actual = (won) ? 1 : 0;
    return current + (this.k * (actual - expected));
  }

};

module.exports = Project;
module.exports.validate = validate;
module.exports.Elo = Elo;