# ql-quill

[![CI](https://github.com/BugCreators/ql-quill/actions/workflows/ci.yml/badge.svg)](https://github.com/BugCreators/ql-quill/actions/workflows/ci.yml)

关于 Quill.js 一些公共配置的封装、支持使用 KityFormula 公式插件，供内部使用

## 安装

```bash
npm i ql-quill quill
```

`quill` 是 `peerDependencies`：需要宿主项目自己安装，避免出现两份 quill、两套 `Quill.import` 注册表。

`engines.node` 声明为 `>=16`，指**安装并使用本包**的环境（含打包链）；本仓库自己开发、构建、跑校验需要 Node `>=20`（`devEngines` 已声明，开发依赖中的 `@arethetypeswrong/cli`、`playwright` 要求 20+）。

### 引入样式

样式没有内联进 JS，必须单独引入一次：

```js
import "ql-quill/dist/ql-quill.snow.css";
```

这份 CSS 已经打包了 `quill.snow.css`、`quill-better-table` 与颜色选择器的样式，**不用再引 quill 自己的样式**。走 `<script>` 引入的页面记得同时加载同目录的 `.css`。

## 快速开始

```js
import QlQuill from "ql-quill";
import "ql-quill/dist/ql-quill.snow.css";

const editor = new QlQuill("#editor", {
  placeholder: "请输入内容…",
  limit: 1000,
  onLimit: () => console.warn("已达字数上限"),
  onChange: html => console.log(html),
});

editor.setContents("<p>Hello</p>");
console.log(editor.getHTML());
```

入口 `ql-quill` 注册了全部模块与主题（体积换易用性），下文所有功能开箱可用。

## 国际化

```js
import QlQuill from "ql-quill";
import zhTw from "ql-quill/locale/zh_tw";
import enUs from "ql-quill/locale/en_us";

const qlQuilllocale = QlQuill.import("modules/locale");

// 打印当前语言环境
qlQuilllocale.locale(); // zh_cn

// 切换繁体
qlQuilllocale.locale(zhTw);

// 切换英文
qlQuilllocale.locale(enUs);

// 创建并切换新的语言
qlQuilllocale.locale("custom", { ... });
```

语言包在 `import` 时就注册进全局语言表（副作用），之后可以用语言名切换。语言状态是**模块级全局**的，切换会影响同一页面上的所有实例。

## [配置示例](https://github.com/BugCreators/ql-quill/blob/master/demo/index.html)

本地调试：

```bash
npm install
npm run dev       # 打开 http://localhost:8080/demo/index.html
npm run build     # 构建 dist/ 与 locale/
npm run typecheck
npm run verify    # 包体检：锁文件来源 + pack 内容断言 + publint + attw + 体积预算
npm run smoke     # Playwright 冒烟测试：demo 页 + dist 产物，截图在 smoke-output/
```

> `npm run smoke` 首次需执行 `npx playwright install chromium` 下载浏览器内核。
> `npm run verify` 依赖构建产物，需先跑 `npm run build`；`--skip-lint` 可跳过需要联网的 publint / attw。

## 发布

正式发版走 GitHub Actions 的 **Release** 工作流（手动触发），鉴权用 npm Trusted Publishing（OIDC），仓库里不保存任何 npm 密钥：

1. 把本次改动写进 `CHANGELOG.md` 的 `## Unreleased` 段落（该段落为空时发布会直接失败）
2. Actions → Release → Run workflow，选 `patch` / `minor` / `major`
3. 工作流依次执行：升版本并同步 `package-lock.json` → `typecheck` → `build` → `verify` → 提交 `chore(release): vX.Y.Z` 并打 tag 推回 main → `npm publish --provenance`

npm 侧需预先绑定 Trusted Publisher：Organization `BugCreators`、Repository `ql-quill`、Workflow filename `release.yml`、Environment 留空。

发布失败（多为 OIDC 绑定字段写错）时**不要重跑整条流程**——tag 已推、`Unreleased` 已空，重跑会卡在升版本那步。改用 `resume_tag` 填已存在的 tag（如 `v2.1.0`）重跑：跳过升版本与打 tag，只重建并发布这个版本。`npm run release:prepare -- minor --dry-run` 可在本地预演版本号与 CHANGELOG 改写结果，不写文件。

本地手动发布仍可直接 `npm publish`（`prepublishOnly` 会跑 `typecheck → build → verify`），但版本号与 tag 需自己维护。

## 目录结构

```
src/
├─ index.ts          # 入口：注册全部模块与主题，导出 QlQuill
├─ quill.ts          # QlQuill 类本体（不反向依赖模块，避免循环引用）
├─ types.ts          # 对外类型
├─ globals.d.ts      # window.kfe 等全局声明
├─ core/             # 与具体功能无关的核心：Quill 注册表代理、选项解析、模块补全
├─ modules/          # 模块：对话框、图片上传、字数、表格、公式、粘贴、小题…
├─ blots/            # 自定义 blot
├─ themes/           # snow 主题（工具栏展开、颜色选择器挂载）
├─ ui/               # 颜色选择器
├─ locale/           # 语言包源码，构建后输出到根目录 locale/
├─ worker/           # RTF 解析 worker
├─ assets/           # stylus 样式、图标与图片
└─ vendor/           # 第三方内置代码（颜色选择器）

scripts/build-locale.mjs   # 语言包构建脚本
scripts/release-prepare.mjs # 发版：升版本 + 把 Unreleased 段落固化为版本条目
scripts/smoke-test.mjs     # Playwright 冒烟测试
scripts/verify-package.mjs # 包体检（锁文件来源 / pack 内容 / publint / attw / 体积）
demo/                     # 调试页面与静态资源
```

## Options

选项都放在构造函数第二个参数里。下表中没有的（`theme`、`modules`、`bounds` 等 Quill 原生配置）会原样透传给 Quill，见 [Quill 文档](https://quilljs.com/docs/configuration)。

### 基础

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `toolbar` | `ToolbarConfig` | 见下文 | 工具栏配置，选择器字符串或按钮数组 |
| `placeholder` | `string` | `""` | 内容为空时的占位文案 |
| `value` | `string \| Delta` | — | 初始内容，字符串按 HTML 解析 |
| `locale` | `string \| Locale` | `"zh_cn"` | 默认语言，非默认语言需先 import 语言包 |
| `limit` | `number` | — | 字数上限，设置后右下角出现计数 |
| `onChange` | `(html: string, delta: Delta) => void` | — | 内容变化时触发，传出 HTML 与 Delta |
| `onLimit` | `() => void` | — | 内容超出字数上限时触发 |
| `onFocus` | `() => void` | — | 焦点进入编辑器或工具栏时触发 |
| `onBlur` | `() => void` | — | 焦点离开编辑器与工具栏时触发 |

### 图片

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `imageResize` | `boolean` | `false` | 图片可拖拽缩放 |
| `image` | `() => void \| object` | — | 传函数则接管工具栏图片按钮；传对象见下 |

`image` 传对象时：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mimetypes` | `string[]` | `["image/png", "image/jpeg"]` | 接收的图片类型，**整体替换**默认值；同时决定文件选择框的 `accept` 与拖拽/选择后的过滤 |
| `base64AutoUpload` | `boolean` | `false` | 粘贴 base64 / blob 图片时自动走上传，先插占位再替换 src |
| `clipboard` | `(node: HTMLElement, delta: Delta) => Delta` | — | 遍历粘贴内容里的图片节点，可改写 Delta |
| `action` | `(file, resolve, reject) => void` | — | 真正的上传逻辑，见下 |

### 功能模块

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `formula` | `string` | KityFormula 弹窗页地址，工具栏需有 `"formula"` 按钮 |
| `pasteFromWord` | `boolean` | 从 Word 粘贴保留格式 |
| `import` | `boolean` | 开启「插入重点」，**建议直接写进 `toolbar`** |
| `option` | `boolean` | 开启「插入小题」，**建议直接写进 `toolbar`** |
| `question` | `boolean` | 开启「小题」，**建议直接写进 `toolbar`** |

### 详细说明

#### `toolbar`

不传时用内置默认工具栏：

```js
["bold", "italic", "underline", { script: "sub" }, { script: "super" }, "clean", "table", "image"]
```

传数组时，几个按钮名有特殊行为：

- `"font"` / `"size"` —— 展开成白名单下拉（`14px` 与 `Arial` 不在列表里，但仍作为合法格式接受）
- `"color"` —— 挂载自定义颜色选择器
- `"table"` —— 用 better-table 替换 Quill 原生表格
- `"image"` —— 图片按钮，点击走上传流程（`image` 传函数时改由该函数接管）
- `"formula"` —— 打开公式弹窗（需配 `formula` 选项）
- `"import"` / `"question"` / `"option"` —— 挂载对应模块，且如果只开了选项没写进数组，会自动追加到末尾

传选择器字符串（指向页面里已有的工具栏 DOM）时不做上面任何展开：按钮行为由 DOM 上的 class 决定，自定义模块也按 class 挂载（`.ql-table` / `.ql-question` / `.ql-option` / `.ql-import` / `.ql-color`）。

#### `limit` 与 `onChange`

设置了 `limit` 之后，字数统计接管内容变化回调，两者行为不同：

- 未超限：触发 `onChange`
- 超限：触发 `onLimit`，并把多出的内容从末尾截掉，**不触发 `onChange`**（中文输入法合成期间先不截断，等合成结束再处理）

没设 `limit` 时，每次内容变化都会触发 `onChange`。

#### `image.action`

```js
image: {
  action(file, resolve, reject) {
    const form = new FormData();
    form.append("file", file, file.name);

    upload(form)
      .then(res => resolve(res.url, { width: 200 })) // 第二个参数可选，附加属性到 img 上
      .catch(reject);
  },
}
```

- 必须调用 `resolve(url)`，否则图片不会插入（内部在等这个 Promise）
- 粘贴进来的 base64 / blob 图片会先转成 `File` 再交给 `action`
- 不配 `action` 时：base64 直接插入，其它文件读成 dataURL 插入，不会发起上传

`mimetypes` 是整体替换默认值，不是追加：传 `["image/gif"]` 就只接受 gif。

## 实例 API

`QlQuill` 继承 `Quill`，下面只列**新增或改写**的成员；其余 Quill 原生 API（`getContents`、`getText`、`getLength`、`on`、`getModule`…）行为不变，见 [Quill 文档](https://quilljs.com/docs/api/)。

| 成员 | 说明 |
| --- | --- |
| `locale(preset?, object?)` | 读取当前语言，或切换语言 |
| `setContents(value)` | 设置内容，返回值语义随入参类型不同 |
| `getHTML()` | 取内容 HTML 字符串 |
| `insertImage(src, latex?, attributes?)` | 在光标处插入图片 |
| `setEditorSelection(range?)` | 设置选区（按长度裁剪），并记录为「操作前选区」 |
| `qlOptions` | 构造时摘出的自定义选项 |

### locale

```js
editor.locale();                                        // "zh_cn" —— 不传参读当前语言
editor.locale("en_us");                                 // 切到已注册的语言
editor.locale(zhTw);                                    // 直接传语言包对象（import 时已注册）
editor.locale("custom", { 取消: "Cancel", 确定: "OK" }); // 注册并切换
```

不传参返回当前语言名，传参时返回 `undefined`。语言状态是模块级全局的，切换会影响同页所有实例。

### setContents

```js
editor.setContents("<p>hello</p>"); // HTML 字符串
editor.setContents(delta);          // Delta
editor.setContents(delta.ops);      // Op[]
```

- 传字符串时走 `clipboard.dangerouslyPasteHTML`，**剪贴板 matcher 同样生效** —— `pasteFromWord`、`image.base64AutoUpload` 对粘贴内容的处理会作用在这条路径上；传 `Delta` / `Op[]` 走 Quill 原生路径，不经过 matcher
- **返回值语义随入参类型不同**：字符串分支返回设置后的完整内容 `Delta`，`Delta` / `Op[]` 分支返回本次变更的 `Delta`（Quill 原生行为）。要拿内容请统一用 `getContents()`
- 会触发 `onChange`；设置了 `limit` 时改由字数模块接管，写入内容超过上限会被截断并触发 `onLimit`
- 设置后恢复操作前的选区，超出新内容长度的部分自动裁剪
- 传空字符串清空内容，`ql-blank` 占位态一并恢复

### getHTML

```js
editor.getHTML(); // "<p>hello</p>"
```

等价于 `editor.root.innerHTML`，只给 HTML；要结构化内容用 `getContents()`。

### insertImage

```js
editor.insertImage(url);
editor.insertImage(url, "\\frac{1}{2}");                // 第二个参数写进 data-latex
editor.insertImage(url, "", { width: 20, height: 30 }); // 第三个参数作为 img 属性
```

- 在当前光标处插入，选区里的内容会被替换，插入后光标停在图片之后
- 编辑器还没聚焦也能用（内部先取一次选区）
- `latex` 写进 `data-latex`（公式图再编辑时读回），不传就不写这个属性
- `attributes` 直接作为 `img` 的 HTML 属性（`width` / `height` 是属性，不是 `style`）

### setEditorSelection

```js
editor.setEditorSelection({ index: 0, length: 5 });
```

按当前内容长度裁剪后设置选区，并记录为「操作前选区」—— `setContents` 之后恢复的就是它。不传或传 `null` 只清掉记录，不动光标。

### qlOptions

构造时从入参里摘出的自定义选项（`toolbar`、`limit`、`image`、`onChange` 等），未传的键值为 `undefined`。它是运行时回调的取值来源（`onChange`、`onFocus` 等从这里读），但构造时已生效的配置（`toolbar`、`image`、`limit`）改它不会重新应用。

### 静态成员

`QlQuill.CUSTOM_TOOLS` 是由 toolbar 决定的自定义按钮名，`QlQuill.CUSTOM_OPTIONS` 是需要从 Quill options 中摘出的键，二次封装时可用来对齐选项处理逻辑。
