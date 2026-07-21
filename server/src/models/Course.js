const mongoose = require('mongoose');

// A "Course" is a top-level field of study, e.g. Computer Science, Medicine and Surgery.
// New fields (Law, Engineering, ...) are added by inserting a new Course document -
// no schema or code changes required, keeping the platform scalable.
const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    icon: {
      type: String,
      default: '📚',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
