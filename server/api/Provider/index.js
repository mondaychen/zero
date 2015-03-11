'use strict';

var express = require('express');
var controller = require('./Provider.controller');

var router = express.Router();

router.get('/careTeam', controller.careTeam);
router.get('/provider', controller.provider);
router.post('/phone/:kind/:value/:hasNew/:u/:d', controller.phone);
router.post('/email/:value/:hasNew/:u/:d', controller.email);
/*
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
*/

module.exports = router;