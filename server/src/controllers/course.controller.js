const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/courses
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ name: 1 });
  res.json({ success: true, count: courses.length, data: courses });
});

// GET /api/courses/:slug
const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) throw new ApiError(404, 'Course not found');
  res.json({ success: true, data: course });
});

module.exports = { getCourses, getCourseBySlug };
