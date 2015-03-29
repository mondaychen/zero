'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EmailSchema   = require('./Email.model')['schema'];
var PhoneSchema   = require('./Phone.model')['schema'];
var AddressSchema = require('./Address.model')['schema'];

// set 
// if user makes a downvote action, new flag is removed immediately.
// if user downvotes a new item


var ProviderSchema = new Schema({
	firstName          : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	lastName           : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	middleName         : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	cwid               : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	email              : { fieldValue: [{ type: Schema.Types.ObjectId, ref: 'Email'}], notes: String, notes_history: [String], dateLastModified : { type: Date, default: Date.now } }, // multiple emails could potentially exist
	officePhone        : { fieldValue: [{ type: Schema.Types.ObjectId, ref: 'Phone'}], notes: String, notes_history: [String], dateLastModified : { type: Date, default: Date.now } },// multiple office numbers could potentially exist
	mobilePhone        : { fieldValue: [{ type: Schema.Types.ObjectId, ref: 'Phone'}], notes: String, notes_history: [String], dateLastModified : { type: Date, default: Date.now } }, // multiple mobile numbers could potentially exist
	pagerNum           : { fieldValue: [{ type: Schema.Types.ObjectId, ref: 'Phone'}], notes: String, notes_history: [String], dateLastModified : { type: Date, default: Date.now } },// multiple pager numbers could potentially exist
	faxNum             : { fieldValue: [{ type: Schema.Types.ObjectId, ref: 'Phone'}], notes: String, notes_history: [String], dateLastModified : { type: Date, default: Date.now } },// multiple fax numbers could potentially exist
	NPI                : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } }, // number that can potentially start with 0,
	role               : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	honor              : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } }, // MD, NP, etc.
	photo              : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	contactPreference  : { fieldValue: String, dateLastModified : { type: Date, default: Date.now } },
	//addresses          : { fieldValue: [AddressSchema], dateLastModified : { type: Date, default: Date.now}}
	addresses          : { fieldValue: [{ type: Schema.Types.ObjectId, ref: "Address"}], notes: String, dateLastModified : { type: Date, default: Date.now } }
	/*
	addrCity     : String,
	addrLine1    : String,
	addrLine2    : String,
	addrState    : String,
	addrPostCode : String,
	locName      : String, // i.e “Practice Address, Mailing Address”
	locTypeCode  : String  // i.e “PRACTICE, MAILING”
	*/
});

ProviderSchema.index({ cwid: 1 }, {unique: true });

module.exports = {
	"model"  : mongoose.model('Provider', ProviderSchema),
	"schema" : ProviderSchema
};