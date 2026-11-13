/**
 * 发版前置：按递增类型升版本号，把 CHANGELOG 的 `## Unreleased` 段落固化成本次版本，
 * 并同步 package-lock.json 的根版本，避免出现 lock 与 package.json 版本不一致。
 *
 * 用法：node scripts/release-prepare.mjs <patch|minor|major> [--dry-run]
 * 输出：新版本号写入 stdout；存在 GITHUB_OUTPUT 时追加 `version=<x.y.z>` 供 workflow 取用。
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUMP_TYPES = ["patch", "minor", "major"];
const UNRELEASED = /^##\s+Unreleased\s*$/i;
const ANY_HEADING = /^##\s+\S/;

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const bump = argv.find((arg) => BUMP_TYPES.includes(arg));

function fail(message) {
  console.error(`[release-prepare] ${message}`);
  process.exit(1);
}

if (!bump) fail(`缺少递增类型，可选：${BUMP_TYPES.join(" / ")}`);

const pkgPath = join(ROOT, "package.json");
const lockPath = join(ROOT, "package-lock.json");
const changelogPath = join(ROOT, "CHANGELOG.md");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const current = pkg.version;
const semver = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
if (!semver) fail(`当前版本 ${current} 不是 x.y.z 形式，预发布版本请手动发布`);

const [major, minor, patch] = semver.slice(1).map(Number);
const next =
  bump === "major"
    ? [major + 1, 0, 0]
    : bump === "minor"
      ? [major, minor + 1, 0]
      : [major, minor, patch + 1];
const version = next.join(".");

// Unreleased 段落为空说明这版没写变更，直接失败比发出一个空条目好
const lines = readFileSync(changelogPath, "utf8").split("\n");
const start = lines.findIndex((line) => UNRELEASED.test(line));
if (start === -1) fail("CHANGELOG.md 里找不到 `## Unreleased` 段落");

let end = start + 1;
while (end < lines.length && !ANY_HEADING.test(lines[end])) end += 1;

const body = lines.slice(start + 1, end).join("\n").trim();
if (!body) fail("`## Unreleased` 段落是空的，没有可发布的内容");

const tail = lines.slice(end);
if (tail[0] === "") tail.shift();

// 日期用 UTC，CI 与本机跨时区时不会差一天；新版本条目沿用 `## x.y.z - YYYY-MM-DD` 约定
const date = new Date().toISOString().slice(0, 10);

// 顶部保留一个空的 Unreleased
const nextChangelog = [
  ...lines.slice(0, start),
  "## Unreleased",
  "",
  `## ${version} - ${date}`,
  "",
  body,
  "",
  ...tail,
].join("\n");

if (dryRun) {
  console.log(`[release-prepare] ${current} → ${version}（dry-run，未写入）`);
  console.log("--- CHANGELOG.md 头部预览 ---");
  console.log(nextChangelog.split("\n").slice(0, 8).join("\n"));
  process.exit(0);
}

writeFileSync(pkgPath, `${JSON.stringify({ ...pkg, version }, null, 2)}\n`);
writeFileSync(changelogPath, nextChangelog);

if (existsSync(lockPath)) {
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  lock.version = version;
  if (lock.packages?.[""]) lock.packages[""].version = version;
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

console.log(`[release-prepare] ${current} → ${version}`);
console.log(version);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}
