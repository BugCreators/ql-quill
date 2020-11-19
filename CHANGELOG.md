## v2.0.0-dev.1

- Quill
  - 版本升至 2.0.0-dev.4
- editor
  - 从 quill-image-resize-module 迁移至 quill-blot-formatter
  - image 标签保留 width、style 等属性
  - concvert 方法替换成 dangerouslyPasteHTML
  - 支持表格编辑
  - 字数统计 使用 modules 形式实现
  - 修复空格无法显示问题
- webpack 配置
  - 新增 raw-loader 读取 svg 文件源文本
  - 使用 terser-webpack-plugin 替换 uglifyjs-webpack-plugin 压缩 js 文件

## v1.0.2

- toolbar
  - 修复自定义标签重复添加的问题
  - 修复热更新时原实例未删除问题
- webpack 配置
  - 添加 css 压缩

## v1.0.1

- dialog
  - 修复没有传 title 时 header 消失问题
- editor
  - 修复多实例时 toolbar 节点取值错误问题
  - 修复默认 image 事件插入图片标签时 src 没有值的问题
  - 修复没有字数限制 limit 时 onChange 没有触发的问题
  - 修复公式编辑后有时没有删除原图片的问题
  - formulaReEdit 减少点击事件触发频率
  - quill-image-resize-module 模块本地化 减少打包后的体积
- webpack 配置
  - 添加环境区分
  - 添加 banner
  - 打包压缩配置优化

## v1.0.0

- Official version.
- 新增 dialog 公共组件.
- 新增插入重点、插入小题.
- 新增插入公式、公式图片再编辑.
- imageResize 图片缩放配置化.

## v0.0.4

- 新增自定义图片标签.
- 修复 accpet 传值类型要求不一致问题.

## v0.0.3

- lodash 按需加载.
- 修复没有 export default 的问题.

## v0.0.2

- 修改 package.json 配置.

## v0.0.1

- Initial version.
