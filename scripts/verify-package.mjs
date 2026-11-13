/**
 * 发包体检：npm pack → 内容断言 → publint / attw → 体积阈值
 *
 *   node scripts/verify-package.mjs              # 完整检查
 *   node scripts/verify-package.mjs --skip-lint  # 只查包内容与体积（离线可用）
 *
 * 前置：先执行 `npm run build`，dist/ 与 locale/ 都必须是最新产物。
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipLint = process.argv.includes("--skip-lint");

/** packed 体积上限（当前约 368 kB），防止哪天误把依赖打进包 */
const SIZE_BUDGET_KB = 450;
/** 主产物体积下限，防止产物缺失或被清空 */
const MIN_ARTIFACT_KB = 100;

const REQUIRED = [
  "package.json",
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
  "dist/index.d.ts",
  "dist/ql-quill.es.mjs",
  "dist/ql-quill.cjs.js",
  "dist/ql-quill.umd.js",
  "dist/ql-quill.snow.css",
  "dist/quill.d.ts",
  "dist/types.d.ts",
  "locale/en_us.js",
  "locale/zh_tw.js",
  "locale/en_us.d.ts",
];

/** 这些目录/文件只应存在于仓库里，不该进包 */
const FORBIDDEN = ["src/", "scripts/", "demo/", "node_modules/", "smoke-output/", ".workbuddy/", ".github/"];

const failures = [];
const warnings = [];

function pass(name, detail = "") {
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function warn(name, detail = "") {
  console.log(`  ! ${name}${detail ? ` — ${detail}` : ""}`);
  warnings.push(name);
}

function check(name, ok, detail) {
  ok ? pass(name, detail) : fail(name, detail);
  return ok;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    shell: process.platform === "win32",
    ...options,
  });

  return {
    status: result.status ?? 1,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function npx(args) {
  return run("npx", ["--no-install", ...args]);
}

function packToTarball() {
  const target = mkdtempSync(join(tmpdir(), "ql-quill-pack-"));
  const { status, output } = run("npm", ["pack", "--json", "--pack-destination", target]);

  if (status !== 0) {
    throw new Error(`npm pack 失败：\n${output}`);
  }

  const [info] = JSON.parse(output);

  return { dir: target, info };
}

function checkContents(info) {
  const paths = info.files.map(file => file.path);

  for (const required of REQUIRED) {
    check(`包含 ${required}`, paths.includes(required));
  }

  const leaked = paths.filter(path => FORBIDDEN.some(prefix => path.startsWith(prefix)));
  check("没有泄漏源码/脚本/演示目录", leaked.length === 0, leaked.slice(0, 5).join(", "));

  check("产物文件数合理", info.entryCount > 20, `${info.entryCount} 个`);

  const packedKb = Math.round(info.size / 1024);
  check(
    `packed 体积在预算内（<${SIZE_BUDGET_KB} kB）`,
    packedKb < SIZE_BUDGET_KB,
    `${packedKb} kB`,
  );

  const esKb = Math.round((info.files.find(f => f.path === "dist/ql-quill.es.mjs")?.size || 0) / 1024);
  check(`ES 产物体积正常（>${MIN_ARTIFACT_KB} kB）`, esKb > MIN_ARTIFACT_KB, `${esKb} kB`);

  console.log(`  · 包体积：packed ${packedKb} kB / unpacked ${Math.round(info.unpackedSize / 1024)} kB`);
}

function checkArtifacts() {
  const umd = readFileSync(join(rootDir, "dist/ql-quill.umd.js"), "utf8");
  const css = readFileSync(join(rootDir, "dist/ql-quill.snow.css"), "utf8");
  const cjs = readFileSync(join(rootDir, "dist/ql-quill.cjs.js"), "utf8");

  check("UMD 暴露 QlQuill 全局名", umd.includes("QlQuill"));
  check("CJS 有导出", /module\.exports|exports\./.test(cjs));
  check("CSS 含编辑器样式", css.includes(".ql-editor"));
  check("CSS 含自定义模块样式", css.includes(".ql-word-count") && css.includes(".ql-dialog"));
}

function checkLint() {
  if (skipLint) {
    warn("跳过 publint / attw（--skip-lint）");
    return;
  }

  // attw 会自己 npm pack，上次异常退出可能留下同名 tgz，先清掉避免干扰
  const { name, version } = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8"));
  const strayTarball = join(rootDir, `${name}-${version}.tgz`);
  if (existsSync(strayTarball)) rmSync(strayTarball, { force: true });

  const publint = npx(["publint"]);
  if (publint.status !== 0) {
    fail("publint 未通过", publint.output.split("\n").slice(-3).join(" "));
  } else {
    pass("publint 通过");
    const tips = publint.output.split("\n").filter(line => /^\d+\./.test(line.trim()));
    if (tips.length) warn(`publint 有 ${tips.length} 条建议`, "见输出上方");
  }

  // false-cjs：本包是浏览器专用（Node 里 import 会因缺 DOM 直接抛错），实际消费方只走 bundler；
  // 类型只维护一份 .d.ts、不额外生成 .d.mts，故忽略该规则，其余问题仍会阻断。
  const attw = npx(["attw", "--pack", ".", "--ignore-rules", "false-cjs"]);
  if (attw.status !== 0) {
    fail("attw 类型解析未通过", "见上方表格里的非 🟢 项");
    console.log(attw.output);
  } else {
    pass("attw 四种解析模式（node10 / node16 cjs / node16 esm / bundler）均正常");
  }
}

/** 锁文件 resolved 不该指向第三方镜像：CI 机器访问它们会超时或命中过期证书 */
const MIRROR_HOSTS = ["registry.npm.taobao.org", "registry.npmmirror.com", "cnpmjs.org"];

function checkLockRegistry() {
  const lockPath = join(rootDir, "package-lock.json");
  if (!existsSync(lockPath)) return;

  const offenders = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    const resolved = node.resolved;
    if (typeof resolved === "string" && MIRROR_HOSTS.some(host => resolved.includes(host))) {
      offenders.push(resolved);
    }
    for (const value of Object.values(node)) walk(value);
  };
  walk(JSON.parse(readFileSync(lockPath, "utf8")));

  check(
    "锁文件未指向第三方镜像",
    offenders.length === 0,
    offenders.length ? `${offenders.length} 条，如 ${offenders[0]}` : "",
  );
}

function main() {
  console.log("\n[0] 仓库卫生");
  checkLockRegistry();

  const distReady = existsSync(join(rootDir, "dist/index.d.ts"));
  const localeReady = existsSync(join(rootDir, "locale/en_us.js"));

  if (!distReady || !localeReady) {
    console.error(
      `[verify] 产物缺失（dist: ${distReady ? "有" : "无"}，locale: ${localeReady ? "有" : "无"}），先执行 npm run build`,
    );
    process.exit(1);
  }

  console.log("\n[1] 包内容");
  const { dir, info } = packToTarball();

  try {
    checkContents(info);

    console.log("\n[2] 产物有效性");
    checkArtifacts();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log("\n[3] 包结构与类型解析");
  checkLint();

  if (warnings.length) {
    console.log(`\n提示 ${warnings.length} 条（不阻塞）：${warnings.join("、")}`);
  }

  console.log(
    failures.length
      ? `\n体检未通过，${failures.length} 项失败：\n - ${failures.join("\n - ")}`
      : "\n包体检通过",
  );

  process.exit(failures.length ? 1 : 0);
}

main();
