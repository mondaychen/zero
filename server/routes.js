/**
 * Main application routes
 */

'use strict';

var express = require('express');
var errors  = require('./components/errors');
var router  = new express.Router();

module.exports = function(app) {
  /*
  app.use(function (req, res, next) {
    res.setHeader("X-UA-Compatible", "IE=edge,chrome=1");
    next();
  });
  */


  // Insert routes below
  app.use('/api/Providers', require('./api/Provider'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  //router.route('/:url(api|auth|components|app|bower_components|assets)/*')
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
  });

  //app.use('/', router);

  //app.use('/zero', router);
};