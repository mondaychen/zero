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
var service_url    = 'http://127.0.0.1:5000'


exports.email = function(req, res) {
  var value     = req.params.value; 
  var hasNew    = req.params.hasNew;
  var upVotes   = req.params.u;
  var downVotes = req.params.d;

  var options = { "new" : true };
  var query   = { email: value };
  var update  = { hasNew: hasNew, $inc: {upVotes:upVotes, downVotes:downVotes} };

  Email.findOneAndUpdate(query,update,options,function(err,email) {
    if (err) { console.log(err); return res.json(500,{ error: 'Something blew up!' }); }  
    return res.json(200,email);
  });
}

exports.phone = function(req, res) {
  var value     = req.params.value; 
  var kind      = req.params.kind;
  var hasNew    = req.params.hasNew;
  var upVotes   = req.params.u;
  var downVotes = req.params.d;

  var options = { "new" : true };
  var query   = { number: value, kind:kind };
  var update  = { hasNew: hasNew, $inc: { upVotes:upVotes, downVotes:downVotes } };

  Phone.findOneAndUpdate(query,update,options,function(err,phone) {
    if (err) { console.log(err); return res.json(500,{ error: 'Something blew up!' }); }  
    return res.json(200,phone);
  });
}

function getQuery(req) {
  var url_parts = url.parse(req.url, true);
  return url_parts.query;
}
// Get list of Providers
exports.careTeam = function(req, res) {
  var query = getQuery(req);
  var options = {
    url : service_url + '/2.0/zero/getCareTeam',
    qs  : query
  };

  request(options, function (error, response, body) {
    /* Update or keep provider the same */
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
            var zero_current_values = _.map(zero_current['fieldValue'], function(zero_object) { return zero_object['number'];})
            var new_values = _.difference(ancr_current,zero_current_values);

            if (new_values.length > 0) {
              new_values.forEach(function(number) {
                updatePromiseArray.push(new Promise(function(resolve,reject) {
                  Phone({ number: number, kind: field, hasNew: true})
                  .save(function(err,phone) {
                    if (err) { console.log(err); }
                    console.log(phone);
                    if (phone && phone != undefined) {
                      console.log('im here');
                      console.log(field);
                      zero_member[field]['fieldValue'].push(phone);
                      // resolve statement probably unnecessary
                      resolve(phone);
                    }
                  });
                }).catch(function(err){ console.log('in catch'); console.log(err);}));
              });
            }
          } else if (field == 'email') {
            var zero_current_values = _.map(zero_current['fieldValue'], function(zero_object) { return zero_object['email'];})
            var new_values = _.difference(ancr_current,zero_current_values);

            if (new_values.length > 0) {
              new_values.forEach(function(email) {
                updatePromiseArray.push(new Promise(function(resolve,reject) {
                  //{ number: , kind:field };
                  //var update = { "$setOnInsert" : query };
                  Email({ email: email, hasNew: true})
                  .save(function(err,email) {
                    if (err) { console.log(err); }
                    console.log(email);
                    if (email && email != undefined) {
                      console.log('im here');
                      console.log(field);
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
        }
      });

      return Promise.all(updatePromiseArray).then(function() {
        return new Promise(function(resolve,reject){
          zero_member.save(function(err,member) {
            if (err) { console.log(err); }
            console.log('i made it');
            resolve(member);
          });
        });
      });
    }

    /* Create new provider */
    var createProviderPromise = function (member) {
      var getModelAndIdArrays = function (field,ancr_array,phoneEmailAddressCreatePromiseArray) {
        var temp_output = { "ids" :[], "models" : [] };
        var tempPromise = null;
        var query = null;
        var update = null;
        var options = { "new" : true, "upsert": true };
        member[field].forEach(function(arrayValue) {
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
          }
          else if (field == 'addresses') {
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

      console.log(phoneEmailAddressCreatePromiseArray);
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
            'addresses'          : { 'fieldValue' : zeroMemberAddressOutput['ids'] }
          }).save(function(err, provider) {
            if (err) { console.log(err); }
            resolve(provider);
          });
        });
      });
    }

    if (!error && response.statusCode == 200) {
      var careTeam_result       = JSON.parse(body);
      var careTeam_result_table = {};
      // zero_result_table stores the providers who already exist in the database
      var zero_result_table     = {};
      var careTeam_cwids        = _.map(careTeam_result, function(member) { careTeam_result_table[member["cwid"]] = member; return member["cwid"]; });
      var careTeam_output       = [];
      var test_member = {
        'firstName'         : 'test',
        'lastName'          : 'test',
        'middleName'        : 'test',
        'contactPreference' : null,
        'NPI'               : null,
        'honor'             : 'MD',
        'cwid'              : 'test1',
        'role'              : 'order provider',
        'photo'             : null,
        'email'             : ['test1@med.cornell.edu'],
        'faxNum'            : ['18082582809','testing','testing1'],
        'pagerNum'          : [],
        'officePhone'       : ['18082582809'], 
        'mobilePhone'       : [],
        'addresses'         : []
      }
      careTeam_cwids.push("test1");
      careTeam_result_table["test1"] = test_member;

      var careTeam_promise = Provider.find({"cwid.fieldValue": {$in : careTeam_cwids}})
      .populate('pagerNum.fieldValue email.fieldValue faxNum.fieldValue mobilePhone.fieldValue officePhone.fieldValue addresses.fieldValue')
      .exec();
      careTeam_promise.then(function(found_members) {
        var found_cwids   = _.map(found_members, function(member) { 
          var cwid = member["cwid"]["fieldValue"]; 
          zero_result_table[cwid] = member;
          return cwid;
        });

        var missing_cwids = _.difference(careTeam_cwids,found_cwids);
        var createProviderPromiseArray = [];
        console.log(found_cwids);
        console.log('missing');
        console.log(missing_cwids);

        var sequence = Promise.resolve();
        //var updateSequence = Promise.resolve();

        found_cwids.forEach(function(cwid) {
          sequence.then(function() {
            return updateProviderPromise(zero_result_table[cwid],careTeam_result_table[cwid]);
          })
          .catch(function(err) {
            console.log(err);
          });
        });

        missing_cwids.forEach(function(cwid) {
          sequence.then(function() {
            console.log(cwid);
            return createProviderPromise(careTeam_result_table[cwid]);
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
          console.log('im in here');
          console.log(careTeam_cwids);
          //return res.json(200,careTeam_cwids);
          //
          Provider.find({'cwid.fieldValue': { $in : careTeam_cwids }})
          .populate('pagerNum.fieldValue email.fieldValue faxNum.fieldValue mobilePhone.fieldValue officePhone.fieldValue addresses.fieldValue')
          .exec(function(err,providers) {
            if (err) { console.log(err); }
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
    url : service_url + '/2.0/zero/getProvider',
    qs  : query
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return res.json(200,body);
    }
  });
};

exports.updatePhoneNumber = function(req, response) {
  //req.params.id 

}
/*
exports.index = function(req, res) {
  Provider.find(function (err, Providers) {
    if(err) { return handleError(res, err); }
    return res.json(200, Providers);
  });
};


// Get a single Provider
exports.show = function(req, res) {
  Provider.findById(req.params.id, function (err, Provider) {
    if(err) { return handleError(res, err); }
    if(!Provider) { return res.send(404); }
    return res.json(Provider);
  });
};

// Creates a new Provider in the DB.
exports.create = function(req, res) {
  Provider.create(req.body, function(err, Provider) {
    if(err) { return handleError(res, err); }
    return res.json(201, Provider);
  });
};

// Updates an existing Provider in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Provider.findById(req.params.id, function (err, Provider) {
    if (err) { return handleError(res, err); }
    if(!Provider) { return res.send(404); }
    var updated = _.merge(Provider, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, Provider);
    });
  });
};

// Deletes a Provider from the DB.
exports.destroy = function(req, res) {
  Provider.findById(req.params.id, function (err, Provider) {
    if(err) { return handleError(res, err); }
    if(!Provider) { return res.send(404); }
    Provider.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};
*/

function handleError(res, err) {
  return res.send(500, err);
}