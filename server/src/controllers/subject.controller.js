const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/semesters/:id/subjects
const getSubjectsBySemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);
  if (!semester) throw new ApiError(404, 'Semester/Year not found');

  const subjects = await Subject.find({ semester: semester._id }).sort({ name: 1 });
  res.json({ success: true, semester: semester.name, count: subjects.length, data: subjects });
});

module.exports = { getSubjectsBySemester };
