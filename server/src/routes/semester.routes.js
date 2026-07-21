const express = require('express');
const { getSemestersByCourse } = require('../controllers/semester.controller');

// mergeParams lets this router read :slug from the parent router
// (course.routes.js) when mounted at /api/courses/:slug/semesters
const router = express.Router({ mergeParams: true });

router.get('/', getSemestersByCourse);

module.exports = router;
