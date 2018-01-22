'use strict';

let mongoose = require('mongoose');
let schema = require('validate');

let Sponsor = mongoose.model('Sponsor', {
    name: {type: String, unique: true },
    link: String,
    logoPath: String,
    amount: Number 
});

function validate(sponsor)
{
    let test = schema({
        name: {
            type: 'string',
            required: true,
            message: 'You must provide a sponsor name.'
        },
        link: {
            type: 'string',
            required: true,
            message: 'You must provide a sponsor link.'
        },
        amount: {
            type: 'number',
            required: true,
            message: 'You must provide a amount donated.'
        }
    });
    return test.validate(sponsor);
}

module.exports = Sponsor;
module.exports.validate = validate;