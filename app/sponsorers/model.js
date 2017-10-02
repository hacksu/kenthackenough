'use strict';

let mongoose = require('mongoose');
let schena = require('validate');

let Sponsorer = mongoose.model('Sponsorer', {
    name: {type: String, unique: true },
    link: String,
    logo: String,
});

function validate(sponsorer)
{
    let test = schema({
        name: {
            type: 'string',
            required: true,
            message: 'You must provide a sponsorer name.'
        },
        link: {
            type: 'string',
            require: true,
            message: 'You must provide a sponsorer link.'
        },
        logo: {
            
            type: 'string',
            require: true,
            message: 'You must provide a sponsorer logo.'
        }
    });
    return test.validate(sponsorer);
}

module.exports = Sponsorer;
module.exports.validate = validate;