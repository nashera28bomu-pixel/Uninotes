const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');

/**
 * Registers a single externally-hosted, openly-licensed resource (e.g. an
 * OpenStax textbook) as a Resource document WITHOUT re-hosting the file
 * ourselves - `url` points straight at the publisher's own site. This is the
 * correct approach for sources that are free-to-use/CC-licensed but aren't
 * structured as a scannable GitHub repository (so githubImporter.service.js
 * can't reach them).
 *
 * @param {Object} entry
 * @param {string} entry.courseSlug
 * @param {number} entry.semesterOrder
 * @param {string} entry.subjectSlug
 * @param {string} entry.title
 * @param {string} entry.type - "textbook" | "pdf" | "link"
 * @param {string} entry.url
 * @param {string} entry.source
 * @param {string} entry.license
 * @param {string} entry.attribution
 */
async function importExternalResource(entry) {
  const course = await Course.findOne({ slug: entry.courseSlug });
  if (!course) throw new Error(`Course "${entry.courseSlug}" not found - run the seed script first.`);

  const semester = await Semester.findOne({ course: course._id, order: entry.semesterOrder });
  if (!semester) {
    throw new Error(`Semester/Year ${entry.semesterOrder} not found for course "${entry.courseSlug}".`);
  }

  const subject = await Subject.findOne({ semester: semester._id, slug: entry.subjectSlug });
  if (!subject) {
    throw new Error(`Subject "${entry.subjectSlug}" not found under ${entry.courseSlug} year/semester ${entry.semesterOrder}.`);
  }

  const existing = await Resource.findOne({ subject: subject._id, url: entry.url });
  if (existing) {
    console.log(`Already imported: ${entry.title}`);
    return { imported: false };
  }

  await Resource.create({
    subject: subject._id,
    title: entry.title,
    type: entry.type || 'textbook',
    url: entry.url,
    source: entry.source,
    license: entry.license,
    attribution: entry.attribution,
  });

  console.log(`Imported external resource: ${entry.title}`);
  return { imported: true };
}

async function importExternalBatch(entries) {
  let imported = 0;
  let skipped = 0;
  for (const entry of entries) {
    try {
      const result = await importExternalResource(entry);
      if (result.imported) imported += 1;
      else skipped += 1;
    } catch (err) {
      console.error(`Failed to import "${entry.title}":`, err.message);
    }
  }
  console.log(`External import done: ${imported} imported, ${skipped} already existed.`);
  return { imported, skipped };
}

module.exports = { importExternalResource, importExternalBatch };
