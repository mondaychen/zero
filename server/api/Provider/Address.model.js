'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AddressSchema = new Schema({
	addrCity     : { type: String, default: null},
	addrLine1    : { type: String, default: null},
	addrLine2    : { type: String, default: null},
	addrState    : { type: String, default: null},
	addrPostCode : { type: String, default: null},
	locName      : { type: String, default: null}, // i.e “Practice Address, Mailing Address”
	locTypeCode  : { type: String, default: null},// i.e “PRACTICE, MAILING”
	dateLastModified : {type: Date, default: Date.now }
});

// Dropping address indexing, not using it anyways
//AddressSchema.index({ addrPostCode: 1, addrCity: 1, addrState: 1, addrLine1: 1, locName: 1, locTypeCode: 1 }, {unique: true });

module.exports = {
	"model"  : mongoose.model('Address', AddressSchema),
	"schema" : AddressSchema
};