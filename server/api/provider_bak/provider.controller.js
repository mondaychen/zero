'use strict';

var _ = require('lodash');
var Provider = require('./provider.model');

// Get list of providers
exports.index = function(req, res) {
  Provider.find(function (err, providers) {
    if(err) { return handleError(res, err); }
    return res.json(200, providers);
  });
};

// Get a single provider
exports.show = function(req, res) {
  Provider.findById(req.params.id, function (err, provider) {
    if(err) { return handleError(res, err); }
    if(!provider) { return res.send(404); }
    return res.json(provider);
  });
};

// Creates a new provider in the DB.
exports.create = function(req, res) {
  Provider.create(req.body, function(err, provider) {
    if(err) { return handleError(res, err); }
    return res.json(201, provider);
  });
};

// Updates an existing provider in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Provider.findById(req.params.id, function (err, provider) {
    if (err) { return handleError(res, err); }
    if(!provider) { return res.send(404); }
    var updated = _.merge(provider, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, provider);
    });
  });
};

// Deletes a provider from the DB.
exports.destroy = function(req, res) {
  Provider.findById(req.params.id, function (err, provider) {
    if(err) { return handleError(res, err); }
    if(!provider) { return res.send(404); }
    provider.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}