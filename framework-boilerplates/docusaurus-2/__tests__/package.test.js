const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function readPackageJson() {
  const raw = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
  return JSON.parse(raw);
}

test('docusaurus-2 package.json', async (t) => {
  await t.test('is valid, parseable JSON', () => {
    assert.doesNotThrow(() => readPackageJson());
  });

  await t.test('declares a dependencies section', () => {
    const pkg = readPackageJson();
    assert.ok(pkg.dependencies && typeof pkg.dependencies === 'object');
  });

  await t.test('has an @docusaurus/preset-classic dependency', () => {
    const pkg = readPackageJson();
    assert.ok(
      Object.prototype.hasOwnProperty.call(pkg.dependencies, '@docusaurus/preset-classic')
    );
  });

  await t.test('@docusaurus/preset-classic is pinned to the upgraded version 3.7.0', () => {
    const pkg = readPackageJson();
    assert.equal(pkg.dependencies['@docusaurus/preset-classic'], '3.7.0');
  });

  await t.test('@docusaurus/preset-classic version string is a valid, exact semver (no range operators)', () => {
    const pkg = readPackageJson();
    const version = pkg.dependencies['@docusaurus/preset-classic'];
    assert.match(version, /^\d+\.\d+\.\d+$/);
    assert.ok(!version.startsWith('^') && !version.startsWith('~'), 'expected an exact pinned version, not a range');
  });

  await t.test('@docusaurus/preset-classic version is newer than the previous pinned version (3.5.0)', () => {
    const pkg = readPackageJson();
    const toParts = (v) => v.split('.').map(Number);
    const [major, minor, patch] = toParts(pkg.dependencies['@docusaurus/preset-classic']);
    const [prevMajor, prevMinor, prevPatch] = toParts('3.5.0');

    const isNewerOrEqual =
      major > prevMajor ||
      (major === prevMajor && minor > prevMinor) ||
      (major === prevMajor && minor === prevMinor && patch >= prevPatch);

    assert.ok(
      isNewerOrEqual,
      `expected ${major}.${minor}.${patch} to be >= ${prevMajor}.${prevMinor}.${prevPatch}`
    );
  });

  await t.test('@docusaurus/preset-classic major version matches @docusaurus/core major version', () => {
    const pkg = readPackageJson();
    const presetMajor = pkg.dependencies['@docusaurus/preset-classic'].split('.')[0];
    const coreMajor = pkg.dependencies['@docusaurus/core'].split('.')[0];
    assert.equal(
      presetMajor,
      coreMajor,
      '@docusaurus/preset-classic and @docusaurus/core must share the same major version'
    );
  });

  await t.test('@docusaurus/core version was not unintentionally modified alongside the preset-classic bump', () => {
    const pkg = readPackageJson();
    assert.equal(pkg.dependencies['@docusaurus/core'], '3.0.0');
  });

  await t.test('unrelated dependencies remain untouched by the version bump', () => {
    const pkg = readPackageJson();
    assert.equal(pkg.dependencies['@mdx-js/react'], '^1.6.22');
    assert.equal(pkg.dependencies['clsx'], '^1.2.1');
    assert.equal(pkg.dependencies['prism-react-renderer'], '^1.3.5');
    assert.equal(pkg.dependencies['react'], '^17.0.2');
    assert.equal(pkg.dependencies['react-dom'], '^17.0.2');
  });
});