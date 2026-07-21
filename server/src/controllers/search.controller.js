const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/search?q=query
// Searches across courses, subjects, and resources in parallel and returns
// them grouped, so the frontend can render "Courses", "Subjects", "Resources"
// sections in one response.
const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) throw new ApiError(400, 'Query parameter "q" is required');

  const regex = new RegExp(q, 'i');

  const [courses, subjects, resources] = await Promise.all([
    Course.find({ name: regex }).limit(10),
    Subject.find({ $or: [{ name: regex }, { code: regex }] })
      .populate({ path: 'semester', select: 'name course', populate: { path: 'course', select: 'name slug' } })
      .limit(15),
    Resource.find({ $text: { $search: q } })
      .populate({ path: 'subject', select: 'name slug' })
      .limit(20)
      .catch(() => []), // falls back gracefully if text index isn't built yet
  ]);

  // Fallback regex search on resource titles if the text-index search found nothing
  let resourceResults = resources;
  if (!resourceResults.length) {
    resourceResults = await Resource.find({ title: regex })
      .populate({ path: 'subject', select: 'name slug' })
      .limit(20);
  }

  res.json({
    success: true,
    query: q,
    data: {
      courses,
      subjects,
      resources: resourceResults,
    },
  });
});

module.exports = { globalSearch };
