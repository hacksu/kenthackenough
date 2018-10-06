"use strict"

let mongoose = require('mongoose');

let Points = mongoose.model('Points', {
    redeemer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' },
    pointValue: { type: Number, required: true },
    multiUseRef: { type: mongoose.Schema.Types.ObjectId, ref:"Points", default: null }
});

module.exports = Points;