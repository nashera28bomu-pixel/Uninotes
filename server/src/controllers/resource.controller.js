const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/subjects/:slug/resources
// Note: subject slugs are only unique per-semester (see Subject model), so
// if multiple subjects share a slug across different semesters this returns
// resources for all of them. The frontend should generally reach this via
// the subject's semester context.
const getResourcesBySubject = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ slug: req.params.slug });
  if (!subjects.length) throw new ApiError(404, 'Subject not found');

  const subjectIds = subjects.map((s) => s._id);
  const resources = await Resource.find({ subject: { $in: subjectIds } }).sort({ createdAt: -1 });

  res.json({ success: true, count: resources.length, data: resources });
});

// GET /api/resources/:id
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id).populate({
    path: 'subject',
    select: 'name slug',
  });
  if (!resource) throw new ApiError(404, 'Resource not found');
  res.json({ success: true, data: resource });
});

// POST /api/resources/:id/view
const registerView = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!resource) throw new ApiError(404, 'Resource not found');
  res.json({ success: true, views: resource.views });
});

// POST /api/resources/:id/download
const registerDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloads: 1 } },
    { new: true }
  );
  if (!resource) throw new ApiError(404, 'Resource not found');
  res.json({ success: true, downloads: resource.downloads });
});

module.exports = {
  getResourcesBySubject,
  getResourceById,
  registerView,
  registerDownload,
};
