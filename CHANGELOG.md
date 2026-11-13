# 更新日志

本文件记录 ql-quill 的所有对外发布版本，格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

约定：

- 未发布的改动写在 `## Unreleased` 下；发版时由 `scripts/release-prepare.mjs` 自动固化为 `## x.y.z - YYYY-MM-DD` 条目，并重建一个空的 `## Unreleased`。
- 版本条目按发布时间倒序排列。
- 分类只用六种：`### Added`（新增）、`### Changed`（变更）、`### Deprecated`（废弃）、`### Removed`（移除）、`### Fixed`（修复）、`### Security`（安全）。某类没有内容时省略该标题。
- 只记录对使用方有影响的改动：行为、配置项、类型声明、产物结构、构建与运行环境要求。纯内部重构、注释与文案微调不列。
- 破坏性变更在版本标题下用一行 `> 破坏性变更：…` 说明，兼容处理也写在同一行；版本情况异常（废弃未发布、发布但未打 tag）同样用 `> …` 注明。
- 日期取自 npm 上的发布时间（`npm view ql-quill time`），不取 git tag 时间：仓库里的 tag 存在一次性补打与滞后——`0.0.1`–`1.0.3` 这 8 个 tag 都是 2021-03-11 补打的（这几个版本实际发布于 2020 年），`2.0.0` 的 tag 比发布晚了近四个月——不足以作为发版时间。

## Unreleased

### Changed
- 构建链升级：`vite` 2.9 → 8.3（内核换成 rolldown）、`vite-plugin-dts` 1.7 → 5.1、`typescript` 4.8 → 5.9、`@babel/core` 7.18 → 7.29、`@rollup/plugin-babel` 5.3 → 7.1、`stylus` 0.54 → 0.64、`@types/node` 18 → 22
- 产物因此变小：JS 单文件约 700 kB → 315 kB（此前压缩实际未生效）
- ES 产物顶部注入只认 `quill` 的 `require` 兜底：rolldown 不再把 CJS 依赖（better-table 等）对 external 的 `require` 转成 import，否则浏览器里直接抛 `Calling require for "quill"`
- `tsconfig` 的 `moduleResolution` 由 `node` 改为 `bundler`（`vite` 8 的类型只提供 exports 式入口）；babel 输出插件补 `modules: false`，避免 ES 产物被转成 CJS 互操作形态
- `vite-plugin-dts` 开启 `copyDtsFiles`，把 `src/vendor` 下手写的 `.d.ts` 一并拷进 `dist`（否则 attw 报 internal resolution error）
- 语言包不再依赖 `modules/locale` 的内部类型，改由 `src/locale` 内的 `LocaleRegistry` 描述注册能力
- 开发环境要求由 Node `>=20` 收紧到 `^20.19 || >=22.12`；CI 的 Node 16 job 改为取回 checks 产物、只做解析校验（vite 8 已无法在 16 上构建）
- `image.mimetypes` 改为整体替换默认值：此前传 `["image/gif"]` 实际得到 `["image/gif", "image/jpeg"]`——Quill 用 lodash 合并模块默认值，数组按下标合并而不是替换
- 补充 `image.mimetypes` 类型声明，TypeScript 下可直接配置（运行时本就生效）
- `locale(preset?)` 放宽签名：支持无参调用返回当前语言名，并允许传语言包对象（运行时一直如此，此前类型上只接受必填 `string`）
- 文档：README 重写配置说明，补「引入样式」（`dist/ql-quill.snow.css`，已内含 quill / better-table / 颜色选择器样式，无需再引 quill 自身样式）与快速开始，Options 改为分组表格
- 文档：README 重写「实例 API」，补 `setEditorSelection`、`qlOptions` 与每个成员的示例；点明 `setContents` 返回值语义随入参不同（字符串返回完整内容 Delta，`Delta` / `Op[]` 返回变更 Delta）、字符串分支会走剪贴板 matcher、`limit` 下写入超限会被截断、`insertImage` 不传 `latex` 时不写 `data-latex`
- 文档：README 修正与实现不符的描述——设置 `limit` 后 `onChange` 由字数模块接管、超限时只触发 `onLimit` 并截断；`onLimit` 判据是「超出」；`toolbar` 传数组与传选择器字符串是两套逻辑；`locale` 接受语言名或语言包对象
- 文档：README 补齐遗漏项——`toolbar`、`placeholder`、`formula`，`value` 支持 `Delta`
- 测试：`npm run smoke` 新增图片 `mimetypes` 断言（整体替换 / 文件选择框 accept 跟随 / 未传时走默认）

### Removed
- 删除 `image.accept`：从未实现的空声明，控制图片类型请用 `image.mimetypes`

### Fixed
- `ImageUploader` 不再改写 quill 共享的 `Uploader.DEFAULTS` 对象，避免影响同页使用原生 Uploader 的实例

## 2.1.0 - 2026-11-13

> 破坏性变更：`quill` 由 `dependencies` 改为 `peerDependencies`（宿主需自行安装 quill）；`exports` 收敛为 `ql-quill`、`ql-quill/locale/*`、`ql-quill/dist/*` 三个入口；ES 产物改名 `dist/ql-quill.es.mjs`，深度引用旧路径的需要同步修改。

### Added
- `npm run smoke`：Playwright 跑 demo 页与 dist 产物，输出截图与控制台错误
- `npm run verify`：包内容断言（必需文件 / 泄漏目录 / 体积预算）+ publint + attw
- GitHub Actions `ci.yml`：类型检查 + 构建 + 包体检（Node 20/22）+ Node 16 产物解析校验 + 浏览器冒烟测试
- GitHub Actions `release.yml` 与 `scripts/release-prepare.mjs`：手动触发升版本 → 校验构建 → 打 tag → 通过 npm Trusted Publishing（OIDC）发布，仓库不存 npm 密钥

### Changed
- 目录整理：`assets/`、`plugin/`、`static/`、根 `index.html` 分别归入 `src/assets`、`src/vendor`、`demo/`
- 拆出 `src/core`（选项解析、模块补全、Quill 注册表代理），`src/quill.ts` 只保留编辑器类本体
- 模块层不再引用 `QlQuill` 类，消除 `index ↔ modules` 循环依赖
- 语言包构建改为 `scripts/build-locale.mjs`，去掉 tsx（Node 20+ 下 `npm run build` 报 CJS/ESM 循环加载错误）
- 类型声明只为 `src` 生成，dist 不再混入 node_modules 与第三方 d.ts
- `engines.node` 定为 `>=16`（在 Node 16 的构建链里也能加载本包），开发侧要求 Node `>=20`，由 `devEngines` 声明
- 语言包声明文件不再多一层 `locale/locale/` 嵌套

### Fixed
- 未配置 `image.action` 时上传 base64 图片 Promise 不会 resolve
- Word 粘贴解析 worker 在无图片时未释放
- 小题序号重排在占位符没有元素子节点时抛错
- 语言包 UMD 全局名带 `.ts` 后缀

## 2.0.5 - 2026-07-31

### Changed
- `import` 格式（插入重点）由块级改为行内，不再独占一行

## 2.0.4 - 2026-07-31

### Added
- 插入重点支持取消：再次点击可移除已加的重点格式

### Changed
- 插入重点的工具图标由字体图标换成 SVG

## 2.0.3 - 2026-07-30

### Fixed
- 图片缩放框的初始尺寸与位置取值不准
- 公式图片经缩放等操作后 `data-formula` 等属性丢失

## 2.0.2 - 2026-06-30

### Changed
- 移除针对旧数据类样式的兼容代码（1.x 产生的类名内容需先转成内联样式）

### Fixed
- 部分字符连续输入时的换行异常

## 2.0.1 - 2026-06-29

### Changed
- 插入重点由弹窗输入改为先选中文字再格式化
- 用 `@enzedonline/quill-blot-formatter2` 替代 `quill-blot-formatter`
- 聚焦 / 失焦的判断逻辑调整，样式微调

### Fixed
- 使用输入法输入时占位符没有隐藏

## 2.0.0 - 2026-03-02

### Changed
- 升级 quill 至 2.0.0 正式版（从 1.x 迁移的 rc 阶段改动见 `2.0.0-alpha.1`）
- `setContents` 返回变更 Delta，类型声明同步修正

### Fixed
- 公式编辑器静态资源地址错误

## 2.0.0-alpha.1 - 2026-03-02

> 这个版本发布到了 npm，但仓库里没有对应的 tag，也没有进过更新日志，此处按发布记录补入。

### Added
- 支持 blob 协议图片自动上传
- `dialog` 提供禁用 / 启用确认按钮的方法

### Changed
- 升级 quill 至 2.0.0-rc.2
- `ImageUploader` 改为复用 quill 原生 `Uploader` 模块，不再自行实现上传流程
- 引入 quill-better-table 表格模块
- blotFormatter 的 overlay 限制在容器内，不再溢出
- 导入语言包不再自动切换当前语言

### Removed
- 移除 `image.drop` 参数（拖拽上传始终开启）

### Fixed
- blotFormatter 的 click 监听器未及时清除

## 1.2.0-alpha.20 - 2025-05-26

- 发布测试，无改动

## 1.2.0-alpha.19 - 2025-05-07

### Fixed
- 颜色选择器没有读取当前文字的默认颜色

## 1.2.0-alpha.18 - 2024-11-25

### Changed
- 图片拖拽上传支持一次拖入多张，并过滤非图片文件

## 1.2.0-alpha.17 - 2024-11-25

### Fixed
- 粘贴图片时未阻止默认事件，导致浏览器另开页面

## 1.2.0-alpha.16 - 2024-11-04

### Added
- 支持复制图片后直接粘贴上传

### Removed
- 不再支持 `image.drop`、`image.paste` 参数，拖拽与粘贴上传始终开启

## 1.2.0-alpha.15 - 2024-09-24

### Added
- 支持 blob 协议图片自动上传

## 1.2.0-alpha.14 - 2024-06-26

### Added
- `dialog` 新增禁用 / 启用确认按钮的方法

### Changed
- `import`（插入重点 / 小题）批量插入性能优化

### Fixed
- blotFormatter 的 click 监听器未及时清除

## 1.2.0-alpha.13 - 2024-03-11

### Fixed
- 编辑器固定高度时颜色选择器被遮挡
- 公式图片双击无法进入编辑（`FormulaEditAction` 未清除 dblclick 事件）
- kityformula 插件多层嵌套时的跨域问题

## 1.2.0-alpha.12 - 2023-12-28

### Fixed
- 公式图片双击编辑失效

## 1.2.0-alpha.11 - 2023-12-11

### Fixed
- 图片选中后无法用滚轮滚动编辑器
- `toolbar` 圆角样式

## 1.2.0-alpha.10 - 2023-11-18

### Changed
- 调整内边距，字数统计不再独占一整行
- 默认支持更小的字号

## 1.2.0-alpha.9 - 2023-11-16

### Changed
- 默认注册字号、字体、对齐的内联样式
- `option.action` 的类型定义调整

### Fixed
- blot-formatter 的 overlay 不随容器滚动

## 1.2.0-alpha.8 - 2023-10-17

### Fixed
- `imageUploader` 设置图片宽高无效
- 粘贴图片时未带初始宽高

## 1.2.0-alpha.7 - 2023-10-17

### Added
- `imageUploader` 支持设置插入图片的宽高

## 1.2.0-alpha.6 - 2023-09-25

### Changed
- 替换 `import` 输入框的类名

## 1.2.0-alpha.5 - 2023-01-03

### Added
- `value` 支持 `Delta` 类型

### Changed
- 补全类型声明；`vite-plugin-dts` 升级并限定 Node 版本
- 文档：补充配置说明、实例 API 说明、国际化说明

### Fixed
- sub-option 小题标签无法插入
- iOS 下无法输入

## 1.2.0-alpha.4 - 2022-09-22

### Changed
- 完善类型声明与导出
- quill 的类型扩展提取到单独的 `.d.ts`，方便打包引用
- 打包时汇总声明文件；`ts-morph` 升到 16.0.0，修复静态方法重载时部分类型丢失

## 1.2.0-alpha.3 - 2022-09-22

> 破坏性变更：`quill` 移入开发依赖，不再随本包一起打包，使用方需自行安装；产物新增 CJS 格式并作为 `main`。

### Changed
- 完善类型声明；统一 `Locale` 定义入口

## 1.2.0-alpha.2 - 2022-09-14

### Changed
- 完善类型声明，打包时汇总声明文件
- `@types/quill` 移入开发依赖

## 1.2.0-alpha.1 - 2022-09-09

### Added
- 添加 TypeScript 支持
- 新增 `.gitattributes`

### Changed
- 公式编辑器宽度适配英文界面
- `color-picker` 声明文件改名 `.ts` → `.d.ts`

## 1.1.7 - 2022-07-29

### Fixed
- 特定旧数据在数据处理阶段报错
- 回显数据中的空格被清除
- 换行样式异常

## 1.1.6 - 2022-07-14

### Fixed
- 1.1.5 引起的「已加载的语言包被重置成对象」问题

## 1.1.5 - 2022-07-14

### Changed
- 更新 Kity Formula Editor

### Fixed
- 初始化编辑器时语言环境被重置
- 点击 toolbar 其它按钮时颜色选择器没有隐藏

## 1.1.4 - 2022-07-13

### Added
- 国际化：简体中文、繁体中文、英文语言包；新增 `locale` 参数设置默认语言
- `image.base64AutoUpload`：粘贴的 base64 图片自动上传
- `imageUploader` 增加上传异常处理
- `dialog` 新增 `contentElement`、`beforeClose` 传参
- `formula` 提取为独立 module

### Changed
- 用 `imageUploader` 替代默认 image handler；图片上传 `input` 的默认 `accept` 调整
- 默认字号改为 14px，字号与字体改为内联样式；字体下拉显示英文名
- 语言数据以中文为键名、导入时自动注册，语言环境统一由全局变量管理
- 旧数据的类名格式（`ql-*`）转成内联样式
- `color-picker` 拆为单独文件，文案与样式调整
- `dialog` 类名提取为静态值，用别的方式替代正则去除 innerHTML 多余空格（IE11 兼容）
- 构建：`build.cssTarget` 防止 rgba 颜色被转成十六进制（IE11 兼容）
- `files` 补 `locale` 目录，精简运行依赖

### Fixed
- 点击编辑器外部时图片缩放框、颜色选择器没有隐藏
- 粘贴 Word 内容中的图片上传未做异常处理
- 公式编辑完成后编辑框内容未清空

## 1.1.3 - 2022-06-02

### Added
- 新增 `onFocus`、`onBlur` 传参

### Changed
- 用 vite 替代 webpack 作为开发构建工具
- 编辑器改为直接继承 quill

### Fixed
- 1.1.2 引起的「函数传参不触发」问题

## 1.1.2 - 2022-05-31

### Changed
- 图片缩放兼容移动端
- `dialog` 渲染到编辑器容器内

### Fixed
- 函数传参无传值时被默认置为 `false`，导致报错
- `question`、`import` 标签的光标位置错误

## 1.1.1 - 2022-05-11

### Fixed
- 可选链语法未经 babel 转换，在旧环境下报错

## 1.1.0 - 2022-05-09

### Added
- `options` 可透传原生 quill 配置
- 新增 `pasteFromWord` 模块（worker 解析 Word 粘贴内容，提取其中的图片）
- 新增 `imageUploader` 模块，图片上传从主流程中分离
- 公式图片支持上传
- `toolbar` 支持二维数组（分组）
- `dialog` 注册到 quill 模块

### Changed
- `question`、`import`、`wordCount` 模块重写；字数统计加缓存以减少更新频次
- 用 `quill-blot-formatter` 替代 `quill-image-resize-module`
- 公式编辑模块重命名并整理文件结构，减少监听事件绑定
- `dataURLtoFile` 转换出的 File 补默认 `name`

### Fixed
- 未启用 `pasteFromWord` 时仍挂载其 clipboard 模块
- 字数统计初始化时不显示字数
- `toolbar` 传一维数组时无法通过自定义配置追加工具
- 上传图片报错、公式图片没有走自定义上传方法
- 开发环境下打包后 debugger 失效

## 1.0.9 - 2021-08-27

### Added
- 新增 `onLimit` 参数，字数超出限制时触发

### Fixed
- 热更新失效

## 1.0.8 - 2021-08-17

### Changed
- webpack 升级到 5，相关依赖同步更新
- 字号选择项改为按 content 生成；白名单与默认列表合并设置
- `image-resize` 插件无需再手动注册
- 调整 kityformula 目录位置，修复 demo 无法访问

### Fixed
- 部分功能在 IE11 下不可用

## 1.0.7 - 2021-06-29

> 1.0.6 已废弃，从未发布到 npm，其改动并入本版。

### Changed
- 默认字体改为 Arial；字号样式改为循环生成
- 颜色选择器适配移动端
- `blots` 目录整理

### Fixed
- 编辑器内滚动时颜色选择器位置错误、其中文字显示异常

## 1.0.5 - 2021-04-09

> 破坏性变更：`setContent` 改名为 `setContents`。

### Added
- 新增 `getHTML` 方法
- 导出 `DEFAULT_SIZE`

### Changed
- 改用原生 toolbar
- 自定义 image handler 的写法调整
- 颜色选择器位置偏移改为取相对值
- 样式调整；去除一些无用依赖

### Fixed
- `imageResize` 为 `false` 时仍无法屏蔽图片缩放

## 1.0.4 - 2021-03-11

### Added
- 新增颜色选择器，替换原来的颜色选择（支持标准色板与色值输入）
- `toolbar` 支持自定义工具栏列表，默认字体、字号列表可配
- webpack 新增 devServer、第三方插件与 icons 别名

### Changed
- 目录结构整理，配置项集成完善
- 默认字体列表更新，中文转 unicode 以解决乱码
- 默认文字大小列表更新
- 颜色选择器位置调整；颜色转换改用插件内部方法
- `dialog` 确定按钮 hover 样式调整

## 1.0.3 - 2020-11-19

### Added
- webpack 新增 raw-loader 读取 svg 源文本

### Changed
- 字数统计改用 modules 形式实现（原 `wordLimit` 组件移除）

### Fixed
- 空格不显示
- `image` 标签的 width、height 等属性丢失

## 1.0.2 - 2020-09-28

### Fixed
- 自定义标签被重复添加
- 热更新时原实例没有被销毁

## 1.0.1 - 2020-09-21

### Added
- webpack 添加 banner

### Changed
- `quill-image-resize-module` 本地化，减少打包体积
- 打包配置区分环境，开启 css 压缩并调整压缩配置

### Fixed
- 多实例时 toolbar 节点取值错误
- 默认 image 事件插入的图片标签 `src` 为空
- 没有设置字数限制 `limit` 时 `onChange` 不触发
- 公式编辑后原图片没有被删除；`formulaReEdit` 点击事件触发过于频繁
- `dialog` 未传 `title` 时 header 消失

## 1.0.0 - 2020-09-17

### Added
- 正式版
- 新增 `dialog` 公共组件
- 新增插入重点、插入小题
- 新增插入公式与公式图片再编辑
- `imageResize` 图片缩放改为配置项

### Changed
- `toolbar`、`wordLimit` 拆分为独立组件

## 0.0.4 - 2020-09-15

### Added
- 新增自定义图片标签

### Fixed
- `accept` 传值类型要求前后不一致

## 0.0.3 - 2020-09-10

### Changed
- lodash 改为按需加载

### Fixed
- 缺少 `export default`

## 0.0.2 - 2020-09-10

### Changed
- 修正 `package.json` 配置

## 0.0.1 - 2020-09-10

### Added
- 初始版本
