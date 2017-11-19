'use strict';

let mongoose = require('mongoose');
let schena = require('validate');

let Sponsor = mongoose.model('Sponsor', {
    name: {type: String, unique: true },
    link: String,
    logo: String,
});

let Benefits = mongoose.model('Benefits', {
    companyName: String,
    contactEmail: String,
    send_mentors: Boolean,
    reserve_table: Boolean,
    judge_final_hacks: Boolean,
    speak_at_opening_ceremony: Boolean,
    keynote_speaker: Boolean,
    reserved_space: Boolean,
    logo_on_website: Boolean,
    logo_on_t: Boolean,
    swag_in_swag_bags: Boolean,
    send_recruiters: Boolean,
    resume_book_after: Boolean,
    resume_book_before: Boolean,
    resume_book_before: Boolean,
    hacksu_lesson: Boolean,
    hacksu_logo_on_website: Boolean,
    hacksu_name_on_website: Boolean,
    hacksu_logo_on_t: Boolean,
    hacksu_big_logo_on_t: Boolean,
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

module.exports.Sponsor = Sponsor;
module.exports.Benefits = Benefits;
module.exports.validate = validate;