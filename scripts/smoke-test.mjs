/**
 * 冒烟测试：用真实 Chromium 跑一遍 demo 页与构建产物，确认编辑器能初始化、工具栏/模块挂载正常。
 *
 *   node scripts/smoke-test.mjs            # 只测源码 demo
 *   node scripts/smoke-test.mjs --dist     # 额外测 dist 里的 ES 产物
 *
 * 截图与日志输出到 smoke-output/
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import { createServer } from "vite";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(rootDir, "smoke-output");
const withDist = process.argv.includes("--dist");

/** 外链资源加载失败不算测试失败 */
const IGNORABLE = /Failed to load resource|net::ERR|ERR_NAME_NOT_RESOLVED|CORS|favicon/i;

const failures = [];
const consoleErrors = [];

function check(name, ok, detail = "") {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
    failures.push(name);
  }
}

async function startServer() {
  const server = await createServer({
    configFile: join(rootDir, "vite.config.ts"),
    logLevel: "error",
    server: { host: "127.0.0.1", port: 8231, strictPort: false, open: false },
  });

  await server.listen();

  const { port } = server.httpServer.address();

  return { server, base: `http://127.0.0.1:${port}` };
}

async function testDemo(page, base) {
  console.log("\n[1] 源码 demo 页 /demo/index.html");
  await page.goto(`${base}/demo/index.html`, { waitUntil: "networkidle" });

  await page.waitForSelector(".ql-editor", { timeout: 15000 });
  check("编辑器渲染出 .ql-editor", true);

  const toolbarCount = await page.locator(".ql-toolbar .ql-formats button, .ql-toolbar .ql-picker").count();
  check("工具栏按钮已生成", toolbarCount > 0, `count=${toolbarCount}`);

  for (const selector of [".ql-bold", ".ql-table", ".ql-color", ".ql-import", ".ql-question"]) {
    check(`工具栏包含 ${selector}`, (await page.locator(selector).count()) > 0);
  }

  const sizeOptions = await page.locator(".ql-toolbar .ql-picker.ql-size .ql-picker-item").count();
  check("字号下拉按白名单展开", sizeOptions > 5, `options=${sizeOptions}`);

  const countText = await page.locator(".ql-word-count .ql-word-entered").innerText();
  check("字数统计已挂载", Number(countText) > 0, `count=${countText}`);

  // 输入：聚焦末尾并敲字，字数应该增长
  await page.locator(".ql-editor").click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type("冒烟测试abc");
  await page.waitForTimeout(120);

  const countAfter = Number(await page.locator(".ql-word-count .ql-word-entered").innerText());
  check("输入后字数增加", countAfter > Number(countText), `${countText} -> ${countAfter}`);

  // 聚焦态类名（on-focus 由 QlQuill 维护）
  check("聚焦时容器加 on-focus", await page.locator(".ql-container.on-focus").count() > 0);

  // 表格：点按钮走 better-table 模块
  await page.getByRole("button", { name: "插入表格" }).click();
  await page.waitForTimeout(300);
  check("插入表格生效", (await page.locator(".ql-editor table").count()) > 0);

  // 清除内容后应回到 ql-blank
  await page.getByRole("button", { name: "修改内容" }).click();
  await page.waitForTimeout(200);
  check("setContents 生效", (await page.locator(".ql-editor").innerText()).includes("Hi"));

  // 语言切换不报错
  await page.getByRole("button", { name: "切换EN" }).click();
  await page.getByRole("button", { name: "切换繁体" }).click();
  check("语言切换未抛错", true);

  await page.screenshot({ path: join(outDir, "demo.png"), fullPage: true });
}

async function testDist(page, base) {
  console.log("\n[2] 构建产物 dist/ql-quill.es.mjs");

  const html = `<!doctype html>
<html><head><link rel="stylesheet" href="/dist/ql-quill.snow.css"></head>
<body><div id="editor"></div>
<script type="module">
  import QlQuill from "/dist/ql-quill.es.mjs";
  window.QlQuill = QlQuill;
  window.__editor = new QlQuill("#editor", {
    toolbar: ["bold", "italic", "table"],
    limit: 50,
    value: "<p>built</p>",
  });
</script>
</body></html>`;

  writeFileSync(join(outDir, "dist.html"), html);

  // 用 vite 的 /@fs 访问 smoke-output 下的页面
  await page.goto(`${base}/smoke-output/dist.html`, { waitUntil: "networkidle" });
  await page.waitForSelector(".ql-editor", { timeout: 15000 });

  check("ES 产物可实例化", true);
  check("产物内工具栏渲染", (await page.locator(".ql-toolbar .ql-bold").count()) > 0);

  const length = await page.evaluate(() => {
    window.__editor.setContents("x".repeat(60));

    return window.__editor.getLength() - 1;
  });
  await page.waitForTimeout(150);

  check("字数上限生效（截断到 50）", length <= 50, `length=${length}`);

  const html2 = await page.evaluate(() => window.__editor.getHTML());
  check("getHTML 可用", typeof html2 === "string" && html2.length > 0);

  await page.screenshot({ path: join(outDir, "dist.png"), fullPage: true });

  await testImageMimetypes(page);
  await testDialogLayout(page);
}

/**
 * 用户传的 mimetypes 必须整体替换默认值。Quill 用 lodash.merge 合并模块
 * DEFAULTS，数组是按下标合并的，默认值一旦留在 DEFAULTS 里就会变成追加。
 */
async function testImageMimetypes(page) {
  console.log("\n[4] 图片 mimetypes");

  const result = await page.evaluate(() => {
    const build = imageOptions => {
      const host = document.createElement("div");
      document.body.appendChild(host);

      const editor = new window.QlQuill(host, {
        toolbar: ["image"],
        image: imageOptions,
      });

      // 工具栏容器插在 host 之前，不是它的子节点
      const toolbar = editor.getModule("toolbar").container;

      // 文件选择框在首次点击图片按钮时才创建，accept 取自 uploader.options.mimetypes
      toolbar.querySelector(".ql-image")?.click();

      const input = toolbar.querySelector("input.ql-image[type=file]");
      const options = editor.getModule("uploader").options;

      toolbar.remove();
      host.remove();

      return { mimetypes: options.mimetypes, accept: input?.getAttribute("accept") };
    };

    return { custom: build({ mimetypes: ["image/gif"] }), byDefault: build({}) };
  });

  check(
    "自定义 mimetypes 整体替换默认值",
    JSON.stringify(result.custom.mimetypes) === '["image/gif"]',
    `mimetypes=${JSON.stringify(result.custom.mimetypes)}`,
  );
  check(
    "文件选择框 accept 跟随 mimetypes",
    result.custom.accept === "image/gif",
    `accept=${result.custom.accept}`,
  );
  check(
    "未传时用默认 mimetypes",
    JSON.stringify(result.byDefault.mimetypes) === '["image/png","image/jpeg"]',
    `mimetypes=${JSON.stringify(result.byDefault.mimetypes)}`,
  );
}

/**
 * 对话框模板必须是「标签之间零空白」拼接：按钮是行内块，
 * 多一个换行就会让间距变成 8px + 一个空格，并可能把对话框挤出视口。
 */
async function testDialogLayout(page) {
  console.log("\n[3] 对话框布局");

  const result = await page.evaluate(() => {
    const dialog = window.__editor.getModule("dialog");
    dialog.setOptions({ title: "标题", content: "<p>正文</p>" });
    dialog.show();

    const footer = document.querySelector(".ql-dialog-footer");
    const cancel = footer.querySelector(".ql-dialog-cancel").getBoundingClientRect();
    const confirm = footer.querySelector(".ql-dialog-confrim").getBoundingClientRect();
    const box = document.querySelector(".ql-dialog").getBoundingClientRect();

    return {
      inViewport: box.top >= 0 && box.bottom <= window.innerHeight + 1,
      width: box.width,
      whitespaceNodes: [...footer.childNodes].filter(node => node.nodeType === 3 && !node.textContent.trim()).length,
      sameLine: Math.abs(cancel.y - confirm.y) < 1,
      gap: confirm.left - cancel.right,
    };
  });

  check("对话框完整渲染在视口内", result.inViewport, `width=${result.width}`);
  check("footer 没有多余空白文本节点", result.whitespaceNodes === 0, `nodes=${result.whitespaceNodes}`);
  check("确定/取消按钮在同一行", result.sameLine);
  check("按钮间距为 8px（来自 CSS margin）", Math.abs(result.gap - 8) < 0.5, `gap=${result.gap}`);

  await page.screenshot({ path: join(outDir, "dialog.png") });
  await page.evaluate(() => window.__editor.getModule("dialog").close());
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const { server, base } = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = `${message.text()}`;
    if (IGNORABLE.test(text)) return;
    consoleErrors.push(text);
  });
  page.on("pageerror", error => consoleErrors.push(`pageerror: ${error.message}`));

  try {
    await testDemo(page, base);
    if (withDist) await testDist(page, base);
  } finally {
    await browser.close();
    await server.close();
  }

  writeFileSync(join(outDir, "console.log"), consoleErrors.join("\n"));

  if (consoleErrors.length) {
    console.log(`\n控制台错误 ${consoleErrors.length} 条：`);
    consoleErrors.slice(0, 10).forEach(line => console.log(`  ! ${line}`));
  }

  console.log(`\n${failures.length ? `失败 ${failures.length} 项：${failures.join("、")}` : "全部通过"}`);
  console.log(`截图见 smoke-output/`);

  process.exit(failures.length || consoleErrors.length ? 1 : 0);
}

main().catch(error => {
  console.error("[smoke] 执行失败", error);
  process.exit(1);
});
