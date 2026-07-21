const express = require('express');
const {
  getResourcesBySubject,
  getResourceById,
  registerView,
  registerDownload,
} = require('../controllers/resource.controller');

const router = express.Router();

// GET /api/subjects/:slug/resources
router.get('/subjects/:slug/resources', getResourcesBySubject);

// GET /api/resources/:id
router.get('/resources/:id', getResourceById);

// POST /api/resources/:id/view
router.post('/resources/:id/view', registerView);

// POST /api/resources/:id/download
router.post('/resources/:id/download', registerDownload);

module.exports = router;
