const mongoose = require('mongoose');

// A "Subject" belongs to a Semester/Year, e.g. "Data Structures and Algorithms"
// under CS Semester 3, or "Human Anatomy" under Medicine Year 1.
const subjectSchema = new mongoose.Schema(
  {
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Slug only needs to be unique within a semester, since the same subject name
// (e.g. "Anatomy") could theoretically recur under different courses.
subjectSchema.index({ semester: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
