## v1.0.7

- editor
  - 修复编辑器内滚动时颜色选择器位置错误问题
  - 调整默认字体为Arial
- color-picker
  - 添加移动端的适配
- 目录结构优化

## v1.0.5

- editor
  - 样式调整
  - setContent 方法改名为 setContents
  - 新增 getHTML 方法
- toolbar
  - 使用原生 toolbar
- 去除一些无用依赖

## v1.0.4

- editor
  - 配置集成完善
  - 新增颜色选择器
- toolbar
  - 新增自定义工具栏列表配置
  - 更新默认字体
  - 更新默认文字大小
- webpack 配置
  - 新增 devServer
  - 新增 第三方插件及 icons 别名
- 目录结构优化

## v1.0.3

- editor
  - 字数统计 使用 modules 形式实现
  - 修复空格不显示问题
  - image 标签保留 width、height 等属性
- webpack 配置
  - 新增 raw-loader 读取 svg 文件源文本

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
