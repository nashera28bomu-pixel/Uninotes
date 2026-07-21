const mongoose = require('mongoose');

// A "Resource" is a single downloadable/viewable study material - a PDF, a
// markdown note, or an external textbook chapter. Everything imported by the
// GitHub importer or the external-source importer lands here.
const resourceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'markdown', 'textbook', 'link'],
      required: true,
    },
    // Direct URL to view/download the file. For GitHub-imported files this is
    // the raw.githubusercontent.com URL. For external CC-licensed textbooks
    // (e.g. OpenStax) this points directly at the publisher's own hosted copy -
    // we never re-host content we don't have redistribution rights to.
    url: {
      type: String,
      required: true,
    },
    // Where this resource originally came from - the GitHub repo URL, or the
    // publisher's site. Always preserved for attribution and traceability.
    source: {
      type: String,
      required: true,
    },
    // License under which the source material is distributed. Only
    // CC-BY / CC-BY-SA / MIT / public-domain (or equivalent open licenses)
    // should ever be imported - see services/githubImporter.service.js.
    license: {
      type: String,
      default: 'Unknown',
    },
    attribution: {
      type: String,
      trim: true,
      default: '',
    },
    // SHA of the blob (from GitHub's tree API) used to avoid importing the
    // same file twice, even across repeated `npm run import` runs.
    sha: {
      type: String,
      index: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// A given file (by sha) should only exist once per subject.
resourceSchema.index({ subject: 1, sha: 1 }, { unique: true, sparse: true });
resourceSchema.index({ title: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
