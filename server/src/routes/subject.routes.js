const express = require('express');
const { getSubjectsBySemester } = require('../controllers/subject.controller');

const router = express.Router();

// GET /api/semesters/:id/subjects
router.get('/:id/subjects', getSubjectsBySemester);

module.exports = router;
