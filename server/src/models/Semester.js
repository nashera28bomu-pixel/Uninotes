const mongoose = require('mongoose');

// A "Semester" belongs to a Course. For Computer Science this represents an
// academic semester (Semester 1, Semester 2 ...). For Medicine and Surgery it
// represents an academic year (Year 1, Year 2 ...) since Kenyan MBChB
// programmes are organised by year, not semester. The generic name/order
// fields keep the model reusable across both conventions.
const semesterSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Semester/Year name is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

semesterSchema.index({ course: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
