const assert = require('node:assert/strict');
const fs = require('node:fs');
const {CommitSplit} = require('release-please/build/src/util/commit-split');
const {CommitExclude} = require('release-please/build/src/util/commit-exclude');
const config = JSON.parse(fs.readFileSync('release-please-config.json', 'utf8'));
const paths = Object.keys(config.packages);
const repositoryConfig = Object.fromEntries(paths.map(path =>
  [path, {excludePaths: config.packages[path]['exclude-paths']}]));
const split = new CommitSplit({packagePaths: paths});
const exclude = new CommitExclude(repositoryConfig);
function releasePaths(files) {
  const commits = exclude.excludeCommits(split.split([{sha: 'fixture', message: 'fix: improve behavior', files}]));
  return Object.keys(commits).filter(path => commits[path].length).sort();
}
for (const path of paths) {
  for (const excluded of config.packages[path]['exclude-paths']) {
    assert.deepEqual(releasePaths([`${excluded}/fixture.lua`]), []);
    assert.deepEqual(releasePaths([`${excluded}/fixture.lua`, `${path}/src/fixture.lua`]), [path]);
  }
  assert.deepEqual(releasePaths([`${path}/src/fixture.lua`]), [path]);
  assert.deepEqual(releasePaths([`${path}/static/fixture.js`]), [path]);
}
assert.deepEqual(releasePaths(['ops/load/src/load/phases.lua', 'tests/test_release_paths.py']), []);
assert.deepEqual(releasePaths(['core/jobs/test/src/fixture.lua', 'platform/inbox/src/fixture.lua']), ['platform/inbox']);
console.log('Release Please excludes unshipped paths and retains shipped changes per module');
