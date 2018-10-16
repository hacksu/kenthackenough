'use strict';
let mongoose = require('mongoose');
let schema = require('validate');
let GAMIFY_COLLECTION = 'collection';
let Gamify = mongoose.model('gamify', {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ,
    points: Number,
    sponsorerID: String,
    reason: String,
    pointID: Number,
    email: String
});
function validate(gamify)
{
    let test = schema({
        userID: {
            type: 'string',
            required: true,
            message: 'Must specify a user.'
        },
        points: {
            type: 'int',
            required: true,
            message: 'Must specify points.'
        },
        sponsorerID: {
            type: 'string',
            required: true,
            message: 'Must specify a source.'
        },
        reason: {
            type: 'string',
            required: true,
            message: 'Must specify a reason.'
        },
        pointID: {
            type: 'string',
            required: true,
            message: 'Must specify a pointID.'
        },
        email: {
            type: 'string',
            required: false,
        }
    });
    return test.validate(gamify);
}
module.exports = Gamify;
module.exports.validate = validate;
module.exports.COLLECTION = GAMIFY_COLLECTION; 