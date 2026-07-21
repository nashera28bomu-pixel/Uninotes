// Runs the configured import. Reads config/sources.json so new sources can
// be added without touching any code - just edit the JSON and re-run.
//
// Run with: npm run import

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('../src/config/db');
const { importRepo } = require('../src/services/githubImporter.service');
const { importExternalBatch } = require('../src/services/externalSource.service');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'sources.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Missing config file: ${CONFIG_PATH}`);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

async function main() {
  await connectDB();

  const config = loadConfig();

  console.log(`Loaded ${config.githubRepos?.length || 0} GitHub source(s) and ${config.externalResources?.length || 0} external resource(s).`);

  const totals = { imported: 0, skippedNoMatch: 0, skippedDuplicate: 0 };

  for (const source of config.githubRepos || []) {
    if (source.license && source.license.startsWith('UNVERIFIED')) {
      console.warn(`\nSkipping ${source.repoUrl} - license marked UNVERIFIED in config/sources.json. Confirm licensing before importing.`);
      continue;
    }
    try {
      const result = await importRepo(source);
      totals.imported += result.imported;
      totals.skippedNoMatch += result.skippedNoMatch;
      totals.skippedDuplicate += result.skippedDuplicate;
    } catch (err) {
      console.error(`Failed to import ${source.repoUrl}:`, err.message);
    }
  }

  if (config.externalResources?.length) {
    console.log('\nImporting external (non-GitHub) resources...');
    await importExternalBatch(config.externalResources);
  }

  console.log(`\nAll done. Total new GitHub resources imported: ${totals.imported}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
