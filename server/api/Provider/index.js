'use strict';

var express = require('express');
var p_controller = require('./Provider.controller');
var n_controller = require('./Message.controller');

var router = express.Router();

router.get('/careTeam', p_controller.careTeam);
router.get('/provider', p_controller.provider);

router.post('/phone/:kind/:provider_id/:notes', p_controller.phone_notes);
//router.post('/phone/:phone_id/:note', controller.phone_note);
router.post('/phone/:kind/:value/:hasNew/:u/:d/:provider_id', p_controller.phone);

router.post('/email/:provider_id/:notes', p_controller.email_notes);
//router.post('/email/:email_id/:note', controller.email_note);
router.post('/email/:value/:hasNew/:u/:d/:provider_id', p_controller.email);

router.post('/message/page/:pageNum/:message', n_controller.sendPage);
router.post('/message/sms/:fromPhone/:toPhone/:message', n_controller.sendSMS);

//router.post('/pager/:number/:message', controller.pager_service);

/*
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
*/

module.exports = router;