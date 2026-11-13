# 更新日志

本文件记录 ql-quill 的所有对外发布版本，格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

约定：

- 未发布的改动写在 `## Unreleased` 下；发版时由 `scripts/release-prepare.mjs` 自动固化为 `## x.y.z - YYYY-MM-DD` 条目，并重建一个空的 `## Unreleased`。
- 版本条目按发布时间倒序排列；同一天发布多个版本时按版本号倒序。
- 分类用 `###` 三级标题（如 `### editor`），无分类的版本直接列条目。
- 日期取自 git tag 的创建时间。`v1.0.4` 及更早的 9 个 tag 是 2021-03-11 一次性补打的，不能代表真实发版日期，故这些版本不标日期。

## Unreleased

### 重构
- 目录整理：`assets/`、`plugin/`、`static/`、根 `index.html` 分别归入 `src/assets`、`src/vendor`、`demo/`
- 拆出 `src/core`（选项解析、模块补全、Quill 注册表代理），`src/quill.ts` 只保留编辑器类本体
- 模块层不再引用 `QlQuill` 类，消除 `index ↔ modules` 循环依赖
- 语言包构建改为 `scripts/build-locale.mjs`，去掉 tsx（Node 20+ 下 `npm run build` 报 CJS/ESM 循环加载错误）
- 类型声明只为 `src` 生成，dist 不再混入 node_modules 与第三方 d.ts
- 新增 `npm run smoke`：Playwright 跑 demo 页与 dist 产物，输出截图与控制台错误
- 新增 `npm run verify`：包内容断言（必需文件/泄漏目录/体积预算）+ publint + attw
- 新增 GitHub Actions `ci.yml`：类型检查 + 构建 + 包体检（Node 20/22）+ Node 16 产物解析校验 + 浏览器冒烟测试
- 新增 GitHub Actions `release.yml` 与 `scripts/release-prepare.mjs`：手动触发升版本 → 校验构建 → 打 tag → 通过 npm Trusted Publishing（OIDC）发布，仓库不存 npm 密钥

### 包结构（对使用方有影响）
- 新增 `exports` map：`ql-quill`、`ql-quill/locale/*`、`ql-quill/dist/*`
- `quill` 由 `dependencies` 改为 `peerDependencies`，避免宿主出现两份 quill 注册表
- ES 产物改名 `dist/ql-quill.es.mjs`（原 `.js` 在 Node 里会被当作 CJS 解析）；深度引用旧路径的需同步修改
- `engines.node` 定为 `>=16`（在 Node 16 的构建链里也能加载本包），开发侧要求 Node `>=20`，由 `devEngines` 声明；语言包声明文件不再多一层 `locale/locale/` 嵌套

### 修复
- 未配置 `image.action` 时上传 base64 图片 Promise 不会 resolve
- Word 粘贴解析 worker 在无图片时未释放
- 小题序号重排在占位符没有元素子节点时抛错
- 语言包 UMD 全局名带 `.ts` 后缀

## 2.0.5 - 2026-07-31

### editor
- import 调整为行内格式

## 2.0.4 - 2026-07-31

### editor
- import 替换svg图标、支持取消重点

## 2.0.3 - 2026-07-30

### editor
- ResizeAction 优化图片尺寸初始值、位置获取
- ImageBlot 修复公式属性丢失问题

## 2.0.2 - 2026-07-01

### editor
- 移除类样式兼容代码
- 处理字符换行异常

## 2.0.1 - 2026-06-29

### editor
- import 由弹窗输入改为选字格式化
- 优化聚焦/失焦判断逻辑
- 样式调整
- 处理使用输入法输入时未隐藏占位符问题
- 使用 @enzedonline/quill-blot-formatter2 替代 quill-blot-formatter

## 2.0.0 - 2026-06-29

- 更新 quill 2.0.0
- 重构 imageUploader 复用原生 Uploader 模块
- 引入 quill-better-table 模块

## 1.2.0-alpha.20 - 2025-05-26

- 发布测试 无改动

## 1.2.0-alpha.19 - 2025-05-26

### editor
- color-picker 自动读取默认颜色

## 1.2.0-alpha.18 - 2025-05-26

### editor
- 图片拖拽上传 支持多图片 过滤非图片文件

## 1.2.0-alpha.17 - 2024-11-25

### editor
- 粘贴图片时阻止默认事件触发

## 1.2.0-alpha.16 - 2024-11-04

### editor
- 支持复制图片粘贴上传
- 不再支持 image.drop 参数 该功能始终开启

## 1.2.0-alpha.15 - 2024-10-29

### editor
- 支持 blob 协议图片自动上传

## 1.2.0-alpha.14 - 2024-10-29

### dialog
- 添加禁用/启用确认按钮方法

### editor
- blotFormatter 清除 click 监听器
- import 优化插入性能

## 1.2.0-alpha.13 - 2024-10-29

### kityformula-plugin
- 处理多层嵌套跨域问题

### editor
- 修复 color-picker 在编辑器固定高度时被遮挡问题
- FormulaEditAction 清除 dblclick 事件

## 1.2.0-alpha.12 - 2023-12-28

### editor
- 处理公式图片双击编辑失效问题

## 1.2.0-alpha.11 - 2023-12-28

### editor
- 处理图片选中后无法滚动问题
- toolbar 圆角

## 1.2.0-alpha.10 - 2023-12-28

### editor
- 调整内边距 字数统计不再占用一整行
- 默认支持更小的字号

## 1.2.0-alpha.9 - 2023-11-16

### editor
- 默认注册字号、字体及对齐内联样式
- blot-formatter overlay 随容器滚动

## 1.2.0-alpha.8 - 2023-10-17

### editor
- imageUploader 修复宽高设置无效问题、粘贴图片时设置其初始宽高

## 1.2.0-alpha.7 - 2023-10-17

### editor
- imageUploader 支持设置插入图片的宽高

## 1.2.0-alpha.6 - 2023-09-25

- 替换输入框类名

## 1.2.0-alpha.5 - 2023-05-16

- 完善类型声明
- 解决 sub-option 小题标签无法插入问题
- 解决 ios 下无法输入问题
- 升级 vite-plugin-dts 指定 node 版本
- 更新文档

## 1.2.0-alpha.4 - 2022-09-22

- 完善类型声明及导出
- quill 类型扩展提取到单独的 ts 文件 方便打包引入

## 1.2.0-alpha.3 - 2022-09-22

- 完善类型声明
- quill 放入开发依赖 不再一同打包
- 新增 cjs 打包方式 并指定为 main 引入路径

## 1.2.0-alpha.2 - 2022-09-14

- 完善类型声明

## 1.2.0-alpha.1 - 2022-09-14

- 添加 ts 支持

### formulaEditor
- 宽度适配英文界面

## 1.1.7 - 2022-07-29

### editor
- 修复特定数据旧数据处理方法报错问题
- 修复回显数据空格被清除问题
- 换行样式问题

## 1.1.6 - 2022-07-14

### editor
- 修复 v1.1.5 引起的已加载的语言被重置成对象问题

## 1.1.5 - 2022-07-14

### editor
- 点击 toolbar 其它按钮时隐藏颜色选择器
- 修复初始化编辑器时语言环境重置的问题

## 1.1.4 - 2022-07-14

### editor
- 编辑器默认字号调整为 14px
- imageUploader 替代默认 image handler
- imageUploader 添加图片上传 error 处理
- image 配置项添加 base64AutoUpload 属性 可自动上传粘贴的 base64 图片
- 点击编辑器外部隐藏图片缩放框、颜色选择器

### 国际化
- 支持简体中文、繁体中文、英文

### dialog
- 将类名提取为静态值
- 使用别的方法替代正则去除 innerHTML 多余的空格（IE11 兼容）
- 新增 contentElement、beforeClose 传参

### formula
- 提取成 module

### vite 配置
- 配置 build.cssTarget 以防止 rgba 颜色被转换成十六进制（IE11 兼容）

## 1.1.3 - 2022-06-02

- 使用 vite 替代 webpack 作为开发构建工具

### editor
- 继承 quill
- 修复 v1.1.2 引起的函数传参不触发的问题
- 新增 onFocus、onBlur 传参

## 1.1.2 - 2022-05-31

- imageResize 图片缩放兼容移动端

### editor
- 修复函数传参无传值时默认置为 false 导致报错问题
- 修复 question、import 标签光标错误问题

### dialog
- 渲染到 editor 中

## 1.1.1 - 2022-05-12

### babel 配置
- 添加可选链语法的转换

## 1.1.0 - 2022-05-12

### editor
- options 参数可传 quill 配置
- question、import 等模块重写
- wordCount 模块优化
- 新增 pasteFromWord 模块
- 使用 quill-blot-formatter 替代 quill-image-resize-module
- 新增 imageUploader 模块
- toolbar 参数支持二维数组

### webpack 配置
- 修复开发环境下 debugger 失效问题

## 1.0.9 - 2022-05-12

### editor
- 新增 onLimit 参数 字数限制时触发

### webpack 配置
- 解决热更新失效问题

## 1.0.8 - 2021-08-17

- 部分功能兼容 IE11

### webpack 配置
- 升级 v5

## 1.0.7 - 2021-06-29

- 目录结构优化

### editor
- 修复编辑器内滚动时颜色选择器位置错误问题
- 调整默认字体为 Arial

### color-picker
- 添加移动端的适配

## 1.0.5 - 2021-04-09

- 去除一些无用依赖

### editor
- 样式调整
- setContent 方法改名为 setContents
- 新增 getHTML 方法

### toolbar
- 使用原生 toolbar

## 1.0.4

- 目录结构优化

### editor
- 配置集成完善
- 新增颜色选择器

### toolbar
- 新增自定义工具栏列表配置
- 更新默认字体
- 更新默认文字大小

### webpack 配置
- 新增 devServer
- 新增 第三方插件及 icons 别名

## 1.0.3

### editor
- 字数统计 使用 modules 形式实现
- 修复空格不显示问题
- image 标签保留 width、height 等属性

### webpack 配置
- 新增 raw-loader 读取 svg 文件源文本

## 1.0.2

### toolbar
- 修复自定义标签重复添加的问题
- 修复热更新时原实例未删除问题

### webpack 配置
- 添加 css 压缩

## 1.0.1

### dialog
- 修复没有传 title 时 header 消失问题

### editor
- 修复多实例时 toolbar 节点取值错误问题
- 修复默认 image 事件插入图片标签时 src 没有值的问题
- 修复没有字数限制 limit 时 onChange 没有触发的问题
- 修复公式编辑后有时没有删除原图片的问题
- formulaReEdit 减少点击事件触发频率
- quill-image-resize-module 模块本地化 减少打包后的体积

### webpack 配置
- 添加环境区分
- 添加 banner
- 打包压缩配置优化

## 1.0.0

- Official version
- 新增 dialog 公共组件
- 新增插入重点、插入小题
- 新增插入公式、公式图片再编辑
- imageResize 图片缩放配置化

## 0.0.4

- 新增自定义图片标签
- 修复 accpet 传值类型要求不一致问题

## 0.0.3

- lodash 按需加载
- 修复没有 export default 的问题

## 0.0.2

- 修改 package.json 配置

## 0.0.1

- Initial version
