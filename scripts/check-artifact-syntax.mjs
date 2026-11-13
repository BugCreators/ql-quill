/**
 * 用「运行它的那个 Node 版本」自带的解析器校验 dist 产物语法，只解析、不执行。
 * 产物依赖 DOM，无法在 Node 里直接 import，所以低版本 Node 的兼容性只能靠这一步证明。
 *
 * 用法：node --experimental-vm-modules scripts/check-artifact-syntax.mjs
 * 退出码：0 全部可解析；1 有文件解析失败。
 */
import { readFileSync } from "node:fs";
import vm from "node:vm";

const CJS_FILES = ["dist/ql-quill.cjs.js", "dist/ql-quill.umd.js"];
const ESM_FILES = ["dist/ql-quill.es.mjs"];

const failures = [];

for (const file of CJS_FILES) {
  try {
    new vm.Script(readFileSync(file, "utf8"), { filename: file });
    console.log(`✓ ${file} 可解析（CJS）`);
  } catch (error) {
    failures.push(file);
    console.error(`✗ ${file} 解析失败：${error.message}`);
  }
}

for (const file of ESM_FILES) {
  try {
    // SourceTextModule 只做解析，不执行模块顶层代码；Node 20 起仍需显式开启实验开关
    new vm.SourceTextModule(readFileSync(file, "utf8"), { identifier: file });
    console.log(`✓ ${file} 可解析（ESM）`);
  } catch (error) {
    failures.push(file);
    const hint = vm.SourceTextModule ? "" : "（缺失时请用 --experimental-vm-modules 运行本脚本）";
    console.error(`✗ ${file} 解析失败：${error.message}${hint}`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} 个产物无法被 node ${process.version} 解析`);
  process.exit(1);
}

console.log(`\n全部产物可被 node ${process.version} 解析`);
