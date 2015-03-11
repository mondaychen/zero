'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EmailSchema = new Schema({
	email            : { type: String, default: null},
	note             : { type: String, default: null},
	dateLastModified : { type: Date, default: Date.now },
	upVotes          : { type: Number, default: 0 },
	downVotes        : { type: Number, default: 0 },
	hasNew           : { type: Boolean, default: false}
});

EmailSchema.index({ email: 1 }, {unique: true });

module.exports = {
	"model" :mongoose.model('Email', EmailSchema),
	"schema":EmailSchema
};