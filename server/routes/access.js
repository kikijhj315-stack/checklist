const express = require('express');
const router = express.Router();
const { logAccess } = require('../controllers/accessController');

router.post('/', logAccess);

module.exports = router;
