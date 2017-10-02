'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

let GAMIFY_COLLECTION = 'collection';

let Gamify = mongoose.model('gamify', {
    userID: String,
    points: Number,
    sponsorerID: String,
    reason: String,
    pointID: Number
});

function validate(gamify)
{
    let test = schema({
        userID: {
            
        },
        points: {

        },
        sponsorerID: {
        
        },
        reason: {
        
        },
        pointID: {
            
        }
    });
    return test.validate(gamify);
}

module.exports = Gamify;
module.exports.validate = validate;
module.exports.COLLECTION = GAMIFY_COLLECTION;