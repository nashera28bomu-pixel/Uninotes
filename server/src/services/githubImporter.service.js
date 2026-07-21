const axios = require('axios');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');

const GITHUB_API = 'https://api.github.com';

function githubClient() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return axios.create({ baseURL: GITHUB_API, headers, timeout: 20000 });
}

/**
 * Parses "https://github.com/owner/repo" (with or without trailing slash,
 * .git suffix, or a /tree/branch/path suffix) into its parts.
 */
function parseRepoUrl(repoUrl) {
  const cleaned = repoUrl.replace(/\.git$/, '').replace(/\/+$/, '');
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)(?:\/(.*))?)?/);
  if (!match) throw new Error(`Not a valid GitHub repository URL: ${repoUrl}`);
  const [, owner, repo, branchFromUrl, pathFromUrl] = match;
  return { owner, repo, branchFromUrl, pathFromUrl };
}

async function getDefaultBranch(client, owner, repo) {
  const { data } = await client.get(`/repos/${owner}/${repo}`);
  return data.default_branch;
}

/**
 * Recursively fetches the full file tree of a repo in a single call using
 * git's recursive tree API (much faster than walking directory-by-directory).
 */
async function getRepoTree(client, owner, repo, branch) {
  const { data } = await client.get(`/repos/${owner}/${repo}/git/trees/${branch}`, {
    params: { recursive: 1 },
  });
  if (data.truncated) {
    console.warn(
      `Warning: tree for ${owner}/${repo}@${branch} was truncated by GitHub (repo too large). Some files may be missed.`
    );
  }
  return data.tree.filter((entry) => entry.type === 'blob');
}

const SUPPORTED_EXTENSIONS = {
  '.pdf': 'pdf',
  '.md': 'markdown',
  '.markdown': 'markdown',
};

function detectType(path) {
  const lower = path.toLowerCase();
  const ext = Object.keys(SUPPORTED_EXTENSIONS).find((e) => lower.endsWith(e));
  return ext ? SUPPORTED_EXTENSIONS[ext] : null;
}

function titleFromPath(path) {
  const filename = path.split('/').pop();
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Tokenizes a subject name/code into lowercase keywords for matching against
// file paths, e.g. "Data Structures and Algorithms" -> ["data","structures","algorithms"]
const STOPWORDS = new Set(['and', 'of', 'the', 'for', 'to', 'in', 'i', 'ii', 'iii', 'a', 'an']);
function keywordsFor(subject) {
  const raw = `${subject.name} ${subject.code || ''}`.toLowerCase();
  return raw
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Picks the best-matching subject for a given file path by scoring keyword
 * overlaps between the path and each candidate subject's name/code.
 * Returns null if nothing scores above the minimum threshold, so files that
 * don't clearly belong anywhere are skipped rather than mis-filed.
 */
function bestSubjectMatch(path, subjectsWithKeywords) {
  const pathLower = path.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const { subject, keywords } of subjectsWithKeywords) {
    const score = keywords.reduce((acc, kw) => acc + (pathLower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = subject;
    }
  }

  return bestScore >= 1 ? best : null;
}

/**
 * Imports a single GitHub repository's PDF and Markdown files into Resource
 * documents, auto-classifying each file into a Subject that already exists
 * under the given course (subjects/semesters must be seeded first - see
 * scripts/seed.js). Files that don't match any subject are skipped and
 * counted, never dumped somewhere arbitrary.
 *
 * @param {Object} opts
 * @param {string} opts.repoUrl - e.g. "https://github.com/ossu/computer-science"
 * @param {string} opts.courseSlug - e.g. "computer-science"
 * @param {string} opts.license - e.g. "MIT", "CC BY 4.0" - must be an open license
 * @param {string} opts.attribution - human-readable attribution line
 * @param {string} [opts.pathPrefix] - restrict import to files under this folder
 */
async function importRepo({ repoUrl, courseSlug, license, attribution, pathPrefix }) {
  const client = githubClient();
  const { owner, repo, branchFromUrl, pathFromUrl } = parseRepoUrl(repoUrl);
  const branch = branchFromUrl || (await getDefaultBranch(client, owner, repo));
  const effectivePrefix = pathPrefix || pathFromUrl || '';

  console.log(`\nImporting ${owner}/${repo}@${branch}${effectivePrefix ? ` (${effectivePrefix}/)` : ''} ...`);

  const tree = await getRepoTree(client, owner, repo, branch);

  const files = tree.filter((entry) => {
    if (effectivePrefix && !entry.path.startsWith(effectivePrefix)) return false;
    return detectType(entry.path) !== null;
  });

  console.log(`Found ${files.length} PDF/Markdown files.`);

  // Load all subjects under this course, with their semester, for matching + saving.
  const Semester = require('../models/Semester');
  const Course = require('../models/Course');
  const course = await Course.findOne({ slug: courseSlug });
  if (!course) throw new Error(`Course "${courseSlug}" not found - run the seed script first.`);

  const semesters = await Semester.find({ course: course._id }).select('_id');
  const subjects = await Subject.find({ semester: { $in: semesters.map((s) => s._id) } });
  const subjectsWithKeywords = subjects.map((subject) => ({ subject, keywords: keywordsFor(subject) }));

  let imported = 0;
  let skippedNoMatch = 0;
  let skippedDuplicate = 0;

  for (const file of files) {
    const subject = bestSubjectMatch(file.path, subjectsWithKeywords);
    if (!subject) {
      skippedNoMatch += 1;
      continue;
    }

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;

    try {
      await Resource.create({
        subject: subject._id,
        title: titleFromPath(file.path),
        type: detectType(file.path),
        url: rawUrl,
        source: repoUrl,
        license: license || 'Unknown',
        attribution: attribution || `${owner}/${repo} on GitHub`,
        sha: file.sha,
      });
      imported += 1;
    } catch (err) {
      if (err.code === 11000) {
        skippedDuplicate += 1; // already imported in a previous run
      } else {
        console.error(`Failed to import ${file.path}:`, err.message);
      }
    }
  }

  console.log(
    `Done: ${imported} imported, ${skippedDuplicate} already existed, ${skippedNoMatch} skipped (no matching subject).`
  );

  return { imported, skippedDuplicate, skippedNoMatch };
}

module.exports = { importRepo, parseRepoUrl };
