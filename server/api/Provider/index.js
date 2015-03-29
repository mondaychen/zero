'use strict';

var express = require('express');
var controller = require('./Provider.controller');

var router = express.Router();

router.get('/careTeam', controller.careTeam);
router.get('/provider', controller.provider);

router.post('/phone/:kind/:provider_id/:notes', controller.phone_note);
router.post('/phone/:kind/:value/:hasNew/:u/:d/:provider_id/:note', controller.phone);

router.post('/email/:provider_id/:notes', controller.email_note);
router.post('/email/:value/:hasNew/:u/:d/:provider_id/:note', controller.email);

/*
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
*/

module.exports = router;