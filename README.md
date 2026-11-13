# ql-quill

关于 Quill.js 一些公共配置的封装、支持使用 KityFormula 公式插件，供内部使用

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

## [配置示例](https://github.com/BugCreators/ql-quill/blob/master/demo/index.html)

本地调试：

```bash
npm install
npm run dev       # 打开 http://localhost:8080/demo/index.html
npm run build     # 构建 dist/ 与 locale/
npm run typecheck
npm run smoke     # Playwright 冒烟测试：demo 页 + dist 产物，截图在 smoke-output/
```

> `npm run smoke` 首次需执行 `npx playwright install chromium` 下载浏览器内核。

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

scripts/build-locale.mjs  # 语言包构建脚本
scripts/smoke-test.mjs    # Playwright 冒烟测试
demo/                     # 调试页面与静态资源
```

## Options

### limit `number`

文本字数限制

### onLimit `() => void`

字数达到上限时触发

### value `string`

默认文本

### onChange `(value: string) => void`

富文本值改变时触发

### image `() => void | object`

#### () => void

自定义上传图片按钮点击事件

#### object

#### image.accept `string`

图片上传 accept

#### image.base64AutoUpload `boolean`

是否自动上传粘贴的 base64 图片

#### image.clipboard `(node: HTMLElement, delta: Delta) => Delta`

遍历剪贴板中的图片

#### image.action `(file: File, reslove: (file: string) => void, reject: () => void) => void`

文件上传时触发

### imageResize `boolean`

图片是否可缩放

### locale `"zh_cn" | "en_us" | "zh_tw"`

编辑器默认语言（默认中文，设置为其它语言时需提前导入语言包）

### pasteFromWord `boolean`

是否开启从 word 复制文本

### onFocus `() => void`

编辑器聚焦时触发

### onBlur `() => void`

编辑器失焦时触发

## 实例 API

### locale `(preset: string, object?: Record<string, string) => void`

切换当前实例语言

### setContents `(value: string | Delta): Delta`

设置内容

### getHTML `() => string`

获取内容 HTML 字符串

### insertImage `(src: string, latex?: string, attributes?: Record<string, string | number>) => void`

插入图片

更多配置及方法可见[Quill](https://quilljs.com/docs/quickstart/)
