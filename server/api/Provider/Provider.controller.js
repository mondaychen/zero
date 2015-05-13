'use strict';

/* 
// can't use this in the case there are multiple providers in the careTeam
// that utilize the same information. Can't do the bulk create and expect all the
// numbers/emails to be created for the provider's access.
// example, provider 1 creates a phonenumber also used by provider2, the bulk create
// will not associate the array with the id since the duplicate creation would be
// dropped.
function getPromisedSave(field,model_array) {
  return new Promise(function(resolve,reject) {
    if (field != 'email') {
      Phone.create(model_array,
        function(err,number_docs) { 
          if (err) {}
          console.log(number_docs);
          resolve(number_docs);
        }
      );
    } else {
      Email.create(model_array,
        function(err,email_docs) {
          if (err) {}
          console.log(email_docs);
          resolve(email_docs);
        }
      );
    }
  });
};
*/

var _              = require('lodash');
var Address        = require('./Address.model')['model'];
var Phone          = require('./Phone.model')['model'];
var Provider       = require('./Provider.model')['model'];
var Email          = require('./Email.model')['model'];
var request        = require('request');
var url            = require('url');
var service_url    = 'http://localhost:8003';
//var service_url    = 'http://ravid.nyp.org'
var ObjectId       = require('mongoose').Types.ObjectId; 
var test           = true;


// test: provider_id: 5500268be47498e8dc023d54
//router.post('/email/:value/:hasNew/:u/:d/:provider_id', controller.email);
exports.email = function(req, res) {
  var value     = req.params.value; 
  var hasNew    = req.params.hasNew;
  var upVotes   = req.params.u;
  var downVotes = req.params.d;
  var _id       = req.params.provider_id

  var options = { "new" : true, "upsert" : true };
  var query   = { email: value };
  var update  = { hasNew: hasNew, $inc: {upVotes:upVotes, downVotes:downVotes} };

  // Todo, use promises?
  Email.findOneAndUpdate(query,update,options,function(err,email) {
    if (err) { console.log(err); return res.json(500,{ error: 'Something blew up!' }); }  

    Provider.findOne({_id: new ObjectId(_id)}, function(err2, provider) {
      if (err2) { console.log(err2); return res.json(500,{ error: 'Something else blew up!' }); }

      var temp = null;
      for (var i = 0; i < provider.email.fieldValue.length; i++) {
        temp = provider.email.fieldValue[i];
        if (temp.equals(email._id)) {
          return res.json(200,email);
        }
      }

      // email was not found to be associated with the provider
      // use set operator here?
      provider.email.fieldValue.push(email);
      provider.email.dateLastModified = Date.now()
      provider.save(function(err3,provider) {
        if (err3) { console.log(err3); return res.json(500,{ error: 'Something again blew up!' }); }
        return res.json(200,provider);
      });
    });
  });
}

exports.email_notes = function(req, res) {
  var _id       = req.params.provider_id;
  var notes     = req.params.notes;

  Provider.findOne({_id: new ObjectId(_id)}, function(err2, provider) {
    if (err2) { console.log(err2); return res.json(500,{ error: 'Something else blew up!' }); }

    if (provider.email.notes != notes) {
      provider.email.notes = notes;
      provider.email.dateLastModified = Date.now();
      provider.email.notes_history.push(notes);
    } else {
      return res.json(500,{ error: 'No edit detected'} );
    }

    provider.save(function(err3, provider) {
      if (err3) { console.log(err3); return res.json(500,{ error: 'Something again blew up!' }); }
      return res.json(200,provider);
    });
  });
}

exports.email_note = function(req, res) {
  var _id  = req.params.email_id;
  var note = req.params.note;

  Email.findOne({_id: new ObjectId(_id)}, function(err2, email) {
    if (err2) { console.log(err2); return res.json(500,{ error: 'Something else blew up!' }); }

    if (email.note != note) {
      email.note = note;
      email.dateLastModified = Date.now();
    } else {
      return res.json(500,{ error: 'No edit detected'} );
    }

    email.save(function(err3, email) {
      if (err3) { console.log(err3); return res.json(500,{ error: 'Something again blew up!' }); }
      return res.json(200,email);
    });
  });
}

//router.post('/phone/:kind/:value/:hasNew/:u/:d/:provider_id', controller.phone);
exports.phone = function(req, res) {
  var value     = req.params.value; 
  var kind      = req.params.kind;
  var hasNew    = req.params.hasNew;
  var upVotes   = req.params.u;
  var downVotes = req.params.d;
  var _id       = req.params.provider_id

  var options = { "new" : true, "upsert" : true };
  var query   = { number: value, kind:kind };
  var update  = { hasNew: hasNew, $inc: { upVotes:upVotes, downVotes:downVotes } };

  // Todo: use promises?
  Phone.findOneAndUpdate(query,update,options,function(err,phone) {
    if (err) { console.log(err); return res.json(500,{ error: 'Something blew up!' }); }  
    Provider.findOne({_id: new ObjectId(_id)}, function(err2, provider) {
      if (err2 || phone == null) { console.log(err2); return res.json(500,{ error: 'Something else blew up!' }); }

      var temp = null;
      for (var i = 0; i < provider[kind].fieldValue.length; i++) {
        temp = provider[kind].fieldValue[i];
        console.log(temp);
        if (temp.equals(phone._id)) {
          return res.json(200,phone);
        }
      }

      provider[kind].fieldValue.push(phone);
      provider[kind].dateLastModified = Date.now()

      provider.save(function(err3,provider) {
        if (err3) { console.log(err3); return res.json(500,{ error: 'Something again blew up!' }); }
        return res.json(200,phone);
      });
    });
  });
}

exports.phone_notes = function(req, res) {
  var _id       = req.params.provider_id;
  var notes     = req.params.notes;
  var kind      = req.params.kind;

  Provider.findOne({_id: new ObjectId(_id)}, function(err2, provider) {
    if (err2) { console.log(err2); return res.json(500,{ error: 'Something else blew up!' }); }

    if (provider.email.notes != notes) {
      provider[kind].notes = notes;
      provider[kind].dateLastModified = Date.now();
      provider[kind].notes_history.push(notes);
    } else {
      return res.json(500,{ error: 'No edit detected'} );
    }

    provider.save(function(err3, provider) {
      if (err3) { console.log(err3); return res.json(500,{ error: 'Something again blew up!' }); }
      return res.json(200,provider);
    });
  });
};

exports.phote_note = function(req, res) {
  var _id  = req.params.phone_id;
  var note = req.params.note;

  Phone.findOne({_id: new ObjectId(_id)}, function(err2, phone) {
    if (err2) { console.log(err2); return res.json(500,{ error: 'Something else blew up!' }); }

    if (phone.note != note) {
      phone.note = note;
      phone.dateLastModified = Date.now();
    } else {
      return res.json(500,{ error: 'No edit detected'} );
    }

    phone.save(function(err3, phone) {
      if (err3) { console.log(err3); return res.json(500,{ error: 'Something again blew up!' }); }
      return res.json(200,phone);
    });
  });
};

function getQuery(req) {
  var url_parts = url.parse(req.url, true);
  return url_parts.query;
}

var updateProviderPromise = function(zero_member,ancr_member) {
  var date = Date.now();
  var ancr_current = null;
  var zero_current = null;
  var updatePromiseArray = [];
  var found = false;
  Object.keys(ancr_member).forEach(function(field) {
    zero_current = zero_member[field];
    ancr_current = ancr_member[field];
    if (Array.isArray(ancr_current)) {

      if (field != 'addresses' && field != 'email') {
        var zero_current_values = _.uniq(_.map(zero_current['fieldValue'], function(zero_object) { return zero_object['number'];}));
        var new_values = _.difference(ancr_current,zero_current_values);

        if (new_values.length > 0) {
          new_values.forEach(function(number) {
            updatePromiseArray.push(new Promise(function(resolve,reject) {
              Phone({ number: number, kind: field, hasNew: true})
              .save(function(err,phone) {
                if (err) { console.log(err); resolve(err); }
                if (phone && phone != undefined) {
                  zero_member[field]['fieldValue'].push(phone);
                  // resolve statement probably unnecessary
                  resolve(phone);
                }
              });
            }).catch(function(err){ console.log('in catch'); console.log(err);}));
          });
        }
      } else if (field == 'email') {
        var zero_current_values = _.uniq(_.map(zero_current['fieldValue'], function(zero_object) { return zero_object['email'];}));
        var new_values = _.difference(ancr_current,zero_current_values);

        if (new_values.length > 0) {
          new_values.forEach(function(email) {
            updatePromiseArray.push(new Promise(function(resolve,reject) {
              //{ number: , kind:field };
              //var update = { "$setOnInsert" : query };
              Email({ email: email, hasNew: true})
              .save(function(err,email) {
                if (err) { console.log(err); resolve(err); }
                console.log(email);
                if (email && email != undefined) {
                  zero_member[field]['fieldValue'].push(email);
                  // resolve statement probably unnecessary
                  resolve(email);
                }
              });
            }).catch(function(err){ console.log('in catch'); console.log(err);}));
          });
        }
      } else if (field == 'addresses') {
        // pass
      }
    } else if (field != 'lookup') {
      zero_member[field]['fieldValue'] = ancr_member[field];
    }
  });

  return Promise.all(updatePromiseArray).then(function() {
    return new Promise(function(resolve,reject){
      zero_member.save(function(err,member) {
        if (err) { console.log('in update provise array save'); console.log(err); resolve(err); }
        resolve(member);
      });
    });
  });
};

/* Create new provider */
var createProviderPromise = function (member) {
  var getModelAndIdArrays = function (field,ancr_array,phoneEmailAddressCreatePromiseArray) {
    var temp_output = { "ids" :[], "models" : [] };
    var tempPromise = null;
    var query = null;
    var update = null;
    var options = { "new" : true, "upsert": true };
    _.uniq(member[field]).forEach(function(arrayValue) {
      if (field != 'email' && field != 'addresses') {
        query = { number: arrayValue, kind:field };
        update = { "$setOnInsert" : query };
        tempPromise = new Promise(function(resolve,reject) {
          Phone.findOneAndUpdate(query,update,options, function(err,phone) {
            if (err) { console.log(err); }
            temp_output["ids"].push(phone._id);
            temp_output["models"].push(phone);
            // resolve statement probably unnecessary
            resolve(phone);
          });
        });
      } else if (field == 'email') {
        query = { email: arrayValue };
        update = { "$setOnInsert" : query };
        tempPromise = new Promise(function(resolve,reject) {
          Email.findOneAndUpdate(query,update,options, function(err,email) {
            if (err) { console.log(err); }
            temp_output["ids"].push(email._id);
            temp_output["models"].push(email);
            // resolve statement probably unnecessary
            resolve(email);
          });
        });
      } else if (field == 'addresses') {
        console.log(JSON.stringify(arrayValue));
        query = {
          addrLine1    : arrayValue["addrLine1"],
          addrLine2    : arrayValue["addrLine2"],
          addrCity     : arrayValue["addrCity"],
          addrState    : arrayValue["addrState"],
          addrPostCode : arrayValue["addrPostCode"],
          locName      : arrayValue["locName"],
          locTypeCode  : arrayValue["locTypeCode"]
        };
        update = { "$setOnInsert" : query };
        tempPromise = new Promise(function(resolve,reject) {
          Address.findOneAndUpdate(query,update,options, function(err,address) {
            if (err) { console.log(err); }
            console.log(address);
            temp_output["ids"].push(address._id);
            temp_output["models"].push(address);
            // resolve statement probably unnecessary
            resolve(address);
          });
        });
      }
      phoneEmailAddressCreatePromiseArray.push(tempPromise);
    });
    return temp_output;
  }

  var phoneEmailAddressCreatePromiseArray = [];
  var zeroMemberEmailOutput               = getModelAndIdArrays('email',member.email,phoneEmailAddressCreatePromiseArray);
  var zeroMemberFaxNumOutput              = getModelAndIdArrays('faxNum',member.faxNum,phoneEmailAddressCreatePromiseArray);
  var zeroMemberPagerNumOutput            = getModelAndIdArrays('pagerNum',member.pagerNum,phoneEmailAddressCreatePromiseArray);
  var zeroMemberOfficePhoneOutput         = getModelAndIdArrays('officePhone',member.officePhone,phoneEmailAddressCreatePromiseArray);
  var zeroMemberMobilePhoneOutput         = getModelAndIdArrays('mobilePhone',member.mobilePhone,phoneEmailAddressCreatePromiseArray);
  var zeroMemberAddressOutput             = getModelAndIdArrays('addresses',member.addresses,phoneEmailAddressCreatePromiseArray);

  return Promise.all(phoneEmailAddressCreatePromiseArray)
  .then(function() {
    return new Promise(function(resolve,reject) {
      Provider({
        'firstName'          : { 'fieldValue' : member.firstName },
        'lastName'           : { 'fieldValue' : member.lastName },
        'middleName'         : { 'fieldValue' : member.middleName },
        'contactPreference'  : { 'fieldValue' : member.contactPreference },
        'NPI'                : { 'fieldValue' : member.NPI },
        'honor'              : { 'fieldValue' : member.honor },
        'cwid'               : { 'fieldValue' : member.cwid },
        'role'               : { 'fieldValue' : member.role },
        'photo'              : { 'fieldValue' : member.photo },
        'email'              : { 'fieldValue' : zeroMemberEmailOutput['ids'] },
        'faxNum'             : { 'fieldValue' : zeroMemberFaxNumOutput['ids'] },
        'pagerNum'           : { 'fieldValue' : zeroMemberPagerNumOutput['ids'] },
        'officePhone'        : { 'fieldValue' : zeroMemberOfficePhoneOutput['ids'] },
        'mobilePhone'        : { 'fieldValue' : zeroMemberMobilePhoneOutput['ids'] },
        //'addresses'          : []//{ 'fieldValue' : member.addresses}
        'addresses'          : { 'fieldValue' : zeroMemberAddressOutput['ids'] },
        'lookup'             : { 'fieldValue' : String(member.cwid) + String(member.NPI) + String(member.firstName) + String(member.middleName) + String(member.lastName) + String(member.honor) }
        //'lookup'             : { 'fieldValue' : this['cwid']['fieldValue'] + this['NPI']['fieldValue'] }
      })
      .save(function(err, provider) {
        if (err) { console.log('saving new provider error'); console.log(err); resolve(err); }
        resolve(provider);
      });
    });
  });
}


// Get list of Providers
exports.careTeam = function(req, res) {
  var query = getQuery(req);
  var options = {
    url : service_url + '/num_ext/zero/getCareTeam',
    qs  : query
  };

  request(options, function (error, response, body) {
    /* Update or keep provider the same */

    if (!error && response.statusCode == 200) {
      var careTeam_result       = JSON.parse(body);
      var careTeam_result_table = {};
      // zero_result_table stores the providers who already exist in the database
      var zero_result_table     = {};
      /*
      var careTeam_cwids        = _.uniq(_.map(careTeam_result, function(member) { 
        if (member != undefined) {
          careTeam_result_table[member["cwid"]] = member;
          return member["cwid"];
        }
      }));
      */
      var careTeam_lookups        = _.uniq(_.map(careTeam_result, function(member) { 
        if (member != undefined) {
          var temp_lookup = String(member["cwid"]) + String(member["NPI"]) + String(member["firstName"]) + String(member["middleName"]) + String(member["lastName"]) + String(member['honor']);
          member['lookup'] = temp_lookup;
          careTeam_result_table[temp_lookup] = member;
          return temp_lookup;
        }
      }));
      //careTeam_cwids            = _.uniq(careTeam_cwids);

      var careTeam_output = [];
      var test_member = {
        'firstName'         : 'test',
        'lastName'          : 'test',
        'middleName'        : 'test1',
        'contactPreference' : null,
        'NPI'               : null,
        'honor'             : 'MD',
        'cwid'              : 'test1',
        'role'              : 'ztest provider',
        'photo'             : null,
        'email'             : ['test1@med.cornell.edu'],
        'faxNum'            : ['18082582809','testing','testing1','testing2'],
        'pagerNum'          : [],
        'officePhone'       : ['18082582809'], 
        'mobilePhone'       : [],
        'addresses'         : [],
        'lookup'            : null
      }
      //careTeam_cwids.push("test1");
      test_member["lookup"] = String(test_member["cwid"]) + String(test_member["NPI"]) + String(test_member["firstName"]) + String(test_member["middleName"]) + String(test_member["lastName"]) + String(test_member["honor"]);
      careTeam_lookups.push(test_member['lookup']);
      careTeam_result_table[test_member['lookup']] = test_member;

      //var careTeam_promise = Provider.find({"cwid.fieldValue": {$in : careTeam_cwids}})
      var careTeam_promise = Provider.find({"lookup.fieldValue": {$in : careTeam_lookups}})
      .populate('pagerNum.fieldValue email.fieldValue faxNum.fieldValue mobilePhone.fieldValue officePhone.fieldValue addresses.fieldValue')
      .exec();

      careTeam_promise.then(function(found_members) {
        var found_lookups = _.map(found_members, function(member) { 
          var temp_lookup = member["lookup"]["fieldValue"]; 
          zero_result_table[temp_lookup] = member;
          return temp_lookup;
        });

        var missing_lookups = _.difference(careTeam_lookups,found_lookups);
        var createProviderPromiseArray = [];
        console.log(found_lookups);
        console.log('missing');
        console.log(missing_lookups);

        var sequence = Promise.resolve();
        //var updateSequence = Promise.resolve();

        found_lookups.forEach(function(lookup) {
          sequence = sequence.then(function() {
            return updateProviderPromise(zero_result_table[lookup],careTeam_result_table[lookup]);
          })
          .catch(function(err, lookup) {
            console.log('update error');
            console.log(err);
            console.log(lookup);
          });
        });

        missing_lookups.forEach(function(lookup) {
          sequence = sequence.then(function() {
            return createProviderPromise(careTeam_result_table[lookup]);
          })
          .catch(function(err) {
            console.log('creation error');
            console.log(err);
            console.log(lookup);
          });
        });

        /*
        return Promise.all(createProviderPromiseArray).then(function(objects) {
          console.log('objects?');
          console.log(objects);
        });
        */
        return sequence.then(function() {
          console.log('im in here');
          console.log(careTeam_lookups);
          //return res.json(200,careTeam_cwids);
          //
          Provider.find({'lookup.fieldValue': { $in : careTeam_lookups }})
          .populate('pagerNum.fieldValue email.fieldValue faxNum.fieldValue mobilePhone.fieldValue officePhone.fieldValue addresses.fieldValue')
          .exec(function(err,providers) {
            if (err) { console.log(err); }
            console.log('im in here x2');
            console.log(providers);
            return res.json(200, providers);
          });                                                                                                                                                                                                                                                                              
        });
        // next stepp, create provider(s) if they don't already exist
        // then, simultaneously? update the current, if there are changes (ie. new phone numbers/email/address)

        //console.log(careTeam_result_table["test1"]);
        //var test1_member = createProvider(careTeam_result_table["test1"]);
      });
      //return res.json(200,careTeam_cwids);
    }
  });
};


exports.provider = function(req, res) {
  var query = getQuery(req);
  var options = {
    url : service_url + '/num_ext/zero/getProvider',
    qs  : query
  };  
  request(options, function (error, response, body) {
    /* Update or keep provider the same */
    if (!error && response.statusCode == 200) {
      //var careTeam_result       = [JSON.parse(body)['hybridized_provider_output']];
      var careTeam_result = null;
      if (test) {
        careTeam_result = [JSON.parse(body)];
      } else {
        careTeam_result = [JSON.parse(body)['hybridized_provider_output']];
      }

      var careTeam_result_table = {};
      // zero_result_table stores the providers who already exist in the database
      var zero_result_table     = {};
      var careTeam_lookups        = _.map(careTeam_result, function(member) { 
        if (member != undefined) {
          var temp_lookup = String(member["cwid"]) + String(member["NPI"]) + String(member["firstName"]) + String(member["middleName"]) + String(member["lastName"]) + String(member['honor']);
          member['lookup'] = temp_lookup;
          careTeam_result_table[temp_lookup] = member;
          return temp_lookup;        }
      });

      var careTeam_output  = [];
      var careTeam_promise = Provider.find({"lookup.fieldValue": {$in : careTeam_lookups}})
      .populate('pagerNum.fieldValue email.fieldValue faxNum.fieldValue mobilePhone.fieldValue officePhone.fieldValue addresses.fieldValue')
      .exec();
      careTeam_promise.then(function(found_members) {
        var found_lookups = _.map(found_members, function(member) { 
          var temp_lookup = member["lookup"]["fieldValue"]; 
          zero_result_table[temp_lookup] = member;
          return temp_lookup;
        });

        var missing_lookups = _.difference(careTeam_lookups,found_lookups);
        var createProviderPromiseArray = [];
        //console.log(found_cwids);
        //console.log('missing');
        //console.log(missing_cwids);

        var sequence = Promise.resolve();
        //var updateSequence = Promise.resolve();

        found_lookups.forEach(function(lookup) {
          sequence = sequence.then(function() {
            return updateProviderPromise(zero_result_table[lookup],careTeam_result_table[lookup]);
          })
          .catch(function(err) {
            console.log(err);
          });
        });

        missing_lookups.forEach(function(lookup) {
          sequence = sequence.then(function() {
            return createProviderPromise(careTeam_result_table[lookup]);
          })
          .catch(function(err) {
            console.log(err);
          });
        });

        /*
        return Promise.all(createProviderPromiseArray).then(function(objects) {
          console.log('objects?');
          console.log(objects);
        });
        */
        return sequence.then(function() {
          Provider.find({'lookup.fieldValue': { $in : careTeam_lookups }})
          .populate('pagerNum.fieldValue email.fieldValue faxNum.fieldValue mobilePhone.fieldValue officePhone.fieldValue addresses.fieldValue')
          .exec(function(err,providers) {
            if (err) { console.log(err); }
            console.log('im in here x2');
            console.log(providers);
            return res.json(200, providers);
          });                                                                                                                                                                                                                                                                              
        });
        // next stepp, create provider(s) if they don't already exist
        // then, simultaneously? update the current, if there are changes (ie. new phone numbers/email/address)

        //console.log(careTeam_result_table["test1"]);
        //var test1_member = createProvider(careTeam_result_table["test1"]);
      });
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
