const Course = require('../models/Course');
const Semester = require('../models/Semester');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/courses/:slug/semesters
const getSemestersByCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) throw new ApiError(404, 'Course not found');

  const semesters = await Semester.find({ course: course._id }).sort({ order: 1 });
  res.json({ success: true, course: course.name, count: semesters.length, data: semesters });
});

module.exports = { getSemestersByCourse };
