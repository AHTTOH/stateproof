// Counts the tests vitest actually runs, per workspace, and checks every count stated in the docs.
//   node scripts/check-test-count.mjs
//
// A stated count is written as an HTML comment marker right before the number, so prose and
// dated progress logs never match by accident:
//   <!-- test-count:total -->118 tests
//   <!-- test-count:@stateproof/contract -->69
// Files scanned: README.md and docs/*.md (top level). With no markers present the script only
// reports. It always writes docs/test-count.json and fails when a test fails, a workspace
// reports no tests, or a stated count differs from the real run.
// The idea (stated counts must equal the real run) comes from JustEnough's
// scripts/check-test-count.mjs (Apache-2.0); this version works per npm workspace.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VITEST = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');
const OUT = path.join(ROOT, 'docs', 'test-count.json');

const rootPkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const workspaces = rootPkg.workspaces
  .map((dir) => ({ dir, pkg: JSON.parse(readFileSync(path.join(ROOT, dir, 'package.json'), 'utf8')) }))
  .filter(({ pkg }) => pkg.scripts?.test);

const tmp = mkdtempSync(path.join(tmpdir(), 'test-count-'));
const counts = {};
const problems = [];
for (const { dir, pkg } of workspaces) {
  const out = path.join(tmp, `${pkg.name.replace(/[^a-z0-9]+/gi, '_')}.json`);
  const run = spawnSync(process.execPath, [VITEST, 'run', '--reporter=json', `--outputFile=${out}`], {
    cwd: path.join(ROOT, dir),
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  if (!existsSync(out)) {
    problems.push(`${pkg.name}: vitest wrote no report (exit ${run.status})`);
    continue;
  }
  const r = JSON.parse(readFileSync(out, 'utf8'));
  counts[pkg.name] = { total: r.numTotalTests, passed: r.numPassedTests, failed: r.numFailedTests, files: r.testResults.length };
  if (r.numTotalTests === 0) problems.push(`${pkg.name}: no tests ran`);
  if (r.numPassedTests !== r.numTotalTests) problems.push(`${pkg.name}: ${r.numTotalTests - r.numPassedTests} test(s) not passing`);
}
const total = Object.values(counts).reduce((n, c) => n + c.total, 0);

const docFiles = ['README.md', ...readdirSync(path.join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`)];
const stated = [];
for (const file of docFiles) {
  const text = readFileSync(path.join(ROOT, file), 'utf8');
  for (const m of text.matchAll(/<!--\s*test-count:([@\w/.-]+)\s*-->\s*\**(\d+)/g)) stated.push({ file, key: m[1], value: Number(m[2]) });
}
for (const s of stated) {
  const actual = s.key === 'total' ? total : counts[s.key]?.total;
  if (actual === undefined) problems.push(`${s.file}: unknown test-count key "${s.key}"`);
  else if (actual !== s.value) problems.push(`${s.file}: states ${s.value} tests for ${s.key}, the run has ${actual}`);
}

writeFileSync(OUT, `${JSON.stringify({ generatedBy: 'scripts/check-test-count.mjs', total, workspaces: counts, stated }, null, 2)}\n`);
for (const [name, c] of Object.entries(counts)) console.log(`${name}: ${c.passed}/${c.total} passed (${c.files} files)`);
console.log(`total: ${total}; stated counts checked: ${stated.length}${stated.length === 0 ? ' (none stated yet)' : ''}; wrote docs/test-count.json`);
if (problems.length > 0) {
  for (const p of problems) console.error(`FAIL: ${p}`);
  process.exit(1);
}
console.log('OK');
