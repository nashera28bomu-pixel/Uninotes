const express = require('express');
const { globalSearch } = require('../controllers/search.controller');

const router = express.Router();

// GET /api/search?q=query
router.get('/', globalSearch);

module.exports = router;
