'use strict';

var express = require('express');
var controller = require('./provider.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:accession', controller.show);
router.post('/', controller.create);
router.put('/:accession', controller.update);
router.patch('/:accession', controller.update);
router.delete('/:accession', controller.destroy);

module.exports = router;