'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PhoneSchema = new Schema({
	number           : { type: String, default: null},
	note             : { type: String, default: null},
	dateLastModified : { type: Date, default: Date.now },
	upVotes          : { type: Number, default: 0 },
	downVotes        : { type: Number, default: 0 },
	hasNew           : { type: Boolean, default: false},
	kind             : { type: String, default: null}
});

PhoneSchema.index({ kind: 1, number: 1}, {unique: true });

module.exports = {
	"model"  : mongoose.model('Phone', PhoneSchema),
	"schema" : PhoneSchema
};