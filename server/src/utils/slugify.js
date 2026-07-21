// Small dependency-free slugify - keeps the project lightweight since this
// is the only place a slug is generated.
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip punctuation
    .replace(/[\s_]+/g, '-') // spaces/underscores -> hyphen
    .replace(/-+/g, '-') // collapse repeats
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphen
}

module.exports = slugify;
