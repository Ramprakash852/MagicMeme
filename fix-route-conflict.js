/**
 * fix-route-conflict.js
 * Deletes the stale [memeId] folder that conflicts with [id].
 *
 * Run from project root:
 *   node fix-route-conflict.js
 */
const fs   = require('fs');
const path = require('path');

function rmrf(target) {
  if (!fs.existsSync(target)) {
    console.log(`⚠  Not found (already deleted?): ${target}`);
    return;
  }
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`✅ Deleted: ${target}`);
}

const stale = path.join(__dirname, 'app', 'api', 'memes', '[memeId]');
rmrf(stale);

// Verify [id] still exists
const canonical = path.join(__dirname, 'app', 'api', 'memes', '[id]');
if (fs.existsSync(canonical)) {
  console.log(`✅ Canonical route kept: app/api/memes/[id]/`);
  const files = fs.readdirSync(canonical, { recursive: true });
  files.forEach(f => console.log(`   └─ ${f}`));
} else {
  console.error('❌ ERROR: app/api/memes/[id]/ is missing!');
}

console.log('\nDone. Now run: npm run dev');
