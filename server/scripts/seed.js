// Builds the Course -> Semester/Year -> Subject taxonomy for Computer Science
// and Medicine and Surgery, aligned with Kenyan university syllabi
// (Kenyatta University / University of Nairobi CS structure, and the KMPDC
// 2022 MBChB Core Curriculum for Medicine). Safe to re-run - it only inserts
// records that don't already exist.
//
// Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Course = require('../src/models/Course');
const Semester = require('../src/models/Semester');
const Subject = require('../src/models/Subject');
const slugify = require('../src/utils/slugify');

async function upsertCourse({ name, slug, icon, description }) {
  return Course.findOneAndUpdate(
    { slug },
    { name, slug, icon, description },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertSemester(courseId, { name, order }) {
  return Semester.findOneAndUpdate(
    { course: courseId, order },
    { course: courseId, name, order },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertSubject(semesterId, { name, code, slug, description }) {
  const finalSlug = slug || slugify(name);
  return Subject.findOneAndUpdate(
    { semester: semesterId, slug: finalSlug },
    { semester: semesterId, name, code: code || '', slug: finalSlug, description: description || '' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

// ---------------------------------------------------------------------------
// Computer Science: 4-year / 8-semester structure (Kenyatta University /
// University of Nairobi / Mount Kenya University common core units)
// ---------------------------------------------------------------------------
const CS_SEMESTERS = [
  {
    order: 1,
    name: 'Year 1, Semester 1',
    subjects: [
      { name: 'Introduction to Computer Programming and Algorithms' },
      { name: 'Discrete Mathematics' },
      { name: 'Introduction to Computer Systems' },
      { name: 'Communication Skills and Academic Writing' },
    ],
  },
  {
    order: 2,
    name: 'Year 1, Semester 2',
    subjects: [
      { name: 'Data Structures and Algorithms' },
      { name: 'Computer Architecture' },
      { name: 'System Analysis and Design' },
      { name: 'Probability and Statistics' },
    ],
  },
  {
    order: 3,
    name: 'Year 2, Semester 1',
    subjects: [
      { name: 'Database Systems' },
      { name: 'Operating Systems' },
      { name: 'Introduction to Web Design and Development' },
      { name: 'Data Communication and Networks' },
    ],
  },
  {
    order: 4,
    name: 'Year 2, Semester 2',
    subjects: [
      { name: 'Object Oriented Programming' },
      { name: 'Design and Analysis of Algorithms' },
      { name: 'Computer Networks' },
      { name: 'Software Engineering' },
    ],
  },
  {
    order: 5,
    name: 'Year 3, Semester 1',
    subjects: [
      { name: 'Artificial Intelligence' },
      { name: 'Compiler Construction' },
      { name: 'Computer Graphics' },
      { name: 'Mobile Application Development' },
    ],
  },
  {
    order: 6,
    name: 'Year 3, Semester 2',
    subjects: [
      { name: 'Advanced Database Systems' },
      { name: 'Cloud Computing' },
      { name: 'Cybersecurity' },
      { name: 'Machine Learning' },
    ],
  },
  {
    order: 7,
    name: 'Year 4, Semester 1',
    subjects: [
      { name: 'Software Project Management' },
      { name: 'Human Computer Interaction' },
      { name: 'Distributed Systems' },
      { name: 'Simulation and Modelling' },
    ],
  },
  {
    order: 8,
    name: 'Year 4, Semester 2',
    subjects: [
      { name: 'Industrial Attachment' },
      { name: 'Capstone Project' },
      { name: 'Emerging Technologies' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Medicine and Surgery: 6-year MBChB structure, mapped from the KMPDC 2022
// Core Curriculum (pre-clinical -> pathology/lab medicine -> clinical years)
// ---------------------------------------------------------------------------
const MEDICINE_SEMESTERS = [
  {
    order: 1,
    name: 'Year 1',
    subjects: [
      { name: 'Human Anatomy', slug: 'human-anatomy' },
      { name: 'Medical Physiology', slug: 'medical-physiology' },
      { name: 'Medical Biochemistry and Molecular Biology' },
      { name: 'Behavioural Sciences' },
      { name: 'Communication Skills for Health Workers' },
      { name: 'Nutrition and Dietetics' },
      { name: 'Computer Use in Health' },
    ],
  },
  {
    order: 2,
    name: 'Year 2',
    subjects: [
      { name: 'Immunology, Microbiology and Parasitology' },
      { name: 'General and Systemic Pathology' },
      { name: 'Haematology and Blood Transfusion' },
      { name: 'Clinical Chemistry' },
      { name: 'Pharmacology and Therapeutics' },
    ],
  },
  {
    order: 3,
    name: 'Year 3',
    subjects: [
      { name: 'Biostatistics and Demography' },
      { name: 'Epidemiology' },
      { name: 'Environmental Health' },
      { name: 'Community Health' },
      { name: 'Introduction to Internal Medicine' },
      { name: 'Introduction to General Surgery' },
    ],
  },
  {
    order: 4,
    name: 'Year 4',
    subjects: [
      { name: 'Internal Medicine' },
      { name: 'General Surgery' },
      { name: 'Reproductive Health (Obstetrics and Gynaecology)' },
      { name: 'Child Health and Paediatrics' },
    ],
  },
  {
    order: 5,
    name: 'Year 5',
    subjects: [
      { name: 'Mental Health' },
      { name: 'Orthopaedics and Traumatology' },
      { name: 'Anaesthesiology and Critical Care Medicine' },
      { name: 'Ophthalmology' },
      { name: 'Otorhinolaryngology' },
      { name: 'Dermatology and Venereology' },
      { name: 'Radiology and Imaging' },
    ],
  },
  {
    order: 6,
    name: 'Year 6',
    subjects: [
      { name: 'Senior Clerkship: Internal Medicine and Geriatrics' },
      { name: 'Senior Clerkship: General Surgery' },
      { name: 'Senior Clerkship: Reproductive Health' },
      { name: 'Senior Clerkship: Child Health and Paediatrics' },
      { name: 'Senior Clerkship: Mental Health' },
      { name: 'Medical Ethics, Professional Conduct and Medico-Legal Issues' },
      { name: 'Medical Electives' },
    ],
  },
];

async function seedCourse(courseDef, semesterDefs) {
  const course = await upsertCourse(courseDef);
  console.log(`Course ready: ${course.name} (${course.slug})`);

  for (const semesterDef of semesterDefs) {
    const semester = await upsertSemester(course._id, { name: semesterDef.name, order: semesterDef.order });
    for (const subjectDef of semesterDef.subjects) {
      await upsertSubject(semester._id, subjectDef);
    }
    console.log(`  ${semesterDef.name}: ${semesterDef.subjects.length} subjects`);
  }
}

async function main() {
  await connectDB();

  await seedCourse(
    {
      name: 'Computer Science',
      slug: 'computer-science',
      icon: '💻',
      description: 'Undergraduate Computer Science, aligned with common Kenyan university curricula.',
    },
    CS_SEMESTERS
  );

  await seedCourse(
    {
      name: 'Medicine and Surgery',
      slug: 'medicine-and-surgery',
      icon: '🩺',
      description: 'MBChB programme, aligned with the KMPDC 2022 Core Curriculum.',
    },
    MEDICINE_SEMESTERS
  );

  console.log('\nSeeding complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
