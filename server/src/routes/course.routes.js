const express = require('express');
const { getCourses, getCourseBySlug } = require('../controllers/course.controller');
const semesterRoutes = require('./semester.routes');

const router = express.Router();

// GET /api/courses/:slug/semesters
router.use('/:slug/semesters', semesterRoutes);

router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);

module.exports = router;
