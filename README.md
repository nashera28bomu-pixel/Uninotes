# Cymor Uni Notes - Backend

Import-only university notes API for Computer Science and Medicine and
Surgery, built for the Kenyan university market. No hardcoded course data -
everything the frontend shows comes from this API, which is in turn populated
only from openly-licensed sources.

## Stack

Node.js, Express, MongoDB Atlas (Mongoose), deployed to Render.

## Setup

```
cd server
npm install
cp .env.example .env
# fill in MONGODB_URI and GITHUB_TOKEN in .env
npm run seed      # creates the Course/Semester/Subject taxonomy
npm run import    # pulls in resources from config/sources.json
npm run dev        # or `npm start` in production
```

`GITHUB_TOKEN` doesn't need any special scopes - a plain classic token
(or even none) works for public repos, but without one you're capped at
60 GitHub API requests/hour, which the importer can burn through quickly on
larger repos. Create one at https://github.com/settings/tokens.

## Project structure

```
server/
  src/
    config/db.js               MongoDB connection
    models/                    Course, Semester, Subject, Resource
    controllers/                request handlers
    routes/                     Express routers
    services/
      githubImporter.service.js  scans a GitHub repo, classifies files by
                                  subject keyword-matching, inserts Resources
      externalSource.service.js  registers non-GitHub CC-licensed resources
                                  (e.g. OpenStax) by direct link, no re-hosting
    middleware/                 errorHandler, notFound
    utils/                      asyncHandler, slugify, ApiError
  scripts/
    seed.js                     builds the Course/Semester/Subject taxonomy
    import.js                   reads config/sources.json and runs imports
  config/sources.json           <- edit this to add/remove content sources
```

Adding a new field of study (Law, Engineering, ...) means adding rows to
`scripts/seed.js` and entries to `config/sources.json` - no route, controller,
or model changes required.

## API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:slug` | Get one course |
| GET | `/api/courses/:slug/semesters` | List semesters/years for a course |
| GET | `/api/semesters/:id/subjects` | List subjects for a semester/year |
| GET | `/api/subjects/:slug/resources` | List resources for a subject |
| GET | `/api/resources/:id` | Get one resource |
| POST | `/api/resources/:id/view` | Increment view count |
| POST | `/api/resources/:id/download` | Increment download count |
| GET | `/api/search?q=` | Search courses, subjects, and resources |
| GET | `/health` | Health check (for Render) |

## Licensing - why this matters

This platform only imports content that is **openly licensed for
redistribution**. That is the whole point of the "import-only" architecture:
we never scrape or re-host material we don't have the right to distribute.

Current sources in `config/sources.json`:

- **OSSU Computer Science** (`ossu/computer-science`) - MIT licensed.
- **freeCodeCamp curriculum** (`freeCodeCamp/freeCodeCamp`, `curriculum/challenges` folder) - BSD-3-Clause.
- **OpenStax Anatomy and Physiology 2e** - CC BY 4.0, linked directly to openstax.org (not re-hosted).
- **OpenDSA** and **muhammadanas05/University-Notes** are included in the
  config but marked `UNVERIFIED` and are **skipped automatically** by
  `npm run import` until you confirm their licensing terms and remove that flag.

See `config/sources.json` -> `_todo` for two follow-ups worth doing before a
public launch:
1. Confirm EnterMedSchool.org's exact GitHub repo URL (their site links to
   one but it wasn't confirmed while building this) and add it once verified.
2. TeachMeSeries and Geeky Medics have excellent medical notes but aren't
   confirmed openly licensed - don't import their content; if you want to
   reference them, add manual `type: "link"` Resource documents pointing to
   their site instead.

## Deduplication

Every imported file's GitHub blob SHA is stored on the Resource document
(`sha` field). Re-running `npm run import` will skip files already imported,
so it's safe to run repeatedly, including after adding new sources to the
config.
