'use strict';

let mongoose = require('mongoose');
let schena = require('validate');

let Sponsor = mongoose.model('Sponsor', {
    name: {type: String, unique: true },
    link: String,
    logo: String,
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
            require: true,
            message: 'You must provide a sponsor link.'
        },
        logo: {
            
            type: 'string',
            require: true,
            message: 'You must provide a sponsor logo.'
        }
    });
    return test.validate(sponsor);
}

module.exports = Sponsor;
module.exports.validate = validate;