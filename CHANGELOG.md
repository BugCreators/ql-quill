## 1.2.0-alpha.20

- 发布测试 无改动

## 1.2.0-alpha.19

- editor
  - color-picker 自动读取默认颜色

## 1.2.0-alpha.18

- editor
  - 图片拖拽上传 支持多图片 过滤非图片文件

## 1.2.0-alpha.17

- editor
  - 粘贴图片时阻止默认事件触发

## 1.2.0-alpha.16

- editor
  - 支持复制图片粘贴上传
  - 不再支持 image.drop 参数 该功能始终开启

## 1.2.0-alpha.15

- editor
  - 支持 blob 协议图片自动上传

## 1.2.0-alpha.14

- dialog

  - 添加禁用/启用确认按钮方法

- editor
  - blotFormatter 清除 click 监听器
  - import 优化插入性能

## 1.2.0-alpha.13

- kityformula-plugin

  - 处理多层嵌套跨域问题

- editor
  - 修复 color-picker 在编辑器固定高度时被遮挡问题
  - FormulaEditAction 清除 dblclick 事件

## 1.2.0-alpha.12

- editor
  - 处理公式图片双击编辑失效问题

## 1.2.0-alpha.11

- editor
  - 处理图片选中后无法滚动问题
  - toolbar 圆角

## 1.2.0-alpha.10

- editor
  - 调整内边距 字数统计不再占用一整行
  - 默认支持更小的字号

## 1.2.0-alpha.9

- editor
  - 默认注册字号、字体及对齐内联样式
  - blot-formatter overlay 随容器滚动

## 1.2.0-alpha.8

- editor
  - imageUploader 修复宽高设置无效问题、粘贴图片时设置其初始宽高

## 1.2.0-alpha.7

- editor
  - imageUploader 支持设置插入图片的宽高

## 1.2.0-alpha.6

- 替换输入框类名

## 1.2.0-alpha.5

- 完善类型声明
- 解决 sub-option 小题标签无法插入问题
- 解决 ios 下无法输入问题
- 升级 vite-plugin-dts 指定 node 版本
- 更新文档

## 1.2.0-alpha.4

- 完善类型声明及导出
- quill 类型扩展提取到单独的 ts 文件 方便打包引入

## 1.2.0-alpha.3

- 完善类型声明
- quill 放入开发依赖 不再一同打包
- 新增 cjs 打包方式 并指定为 main 引入路径

## 1.2.0-alpha.2

- 完善类型声明

## 1.2.0-alpha.1

- 添加 ts 支持
- formulaEditor
  - 宽度适配英文界面

## v1.1.7

- editor
  - 修复特定数据旧数据处理方法报错问题
  - 修复回显数据空格被清除问题
  - 换行样式问题

## v1.1.6

- editor
  - 修复 v1.1.5 引起的已加载的语言被重置成对象问题

## v1.1.5

- editor
  - 点击 toolbar 其它按钮时隐藏颜色选择器
  - 修复初始化编辑器时语言环境重置的问题

## v1.1.4

- editor
  - 编辑器默认字号调整为 14px
  - imageUploader 替代默认 image handler
  - imageUploader 添加图片上传 error 处理
  - image 配置项添加 base64AutoUpload 属性 可自动上传粘贴的 base64 图片
  - 点击编辑器外部隐藏图片缩放框、颜色选择器
- 国际化
  - 支持简体中文、繁体中文、英文
- dialog
  - 将类名提取为静态值
  - 使用别的方法替代正则去除 innerHTML 多余的空格（IE11 兼容）
  - 新增 contentElement、beforeClose 传参
- formula
  - 提取成 module
- vite 配置
  - 配置 build.cssTarget 以防止 rgba 颜色被转换成十六进制（IE11 兼容）

## v1.1.3

- 使用 vite 替代 webpack 作为开发构建工具
- editor
  - 继承 quill
  - 修复 v1.1.2 引起的函数传参不触发的问题
  - 新增 onFocus、onBlur 传参

## v1.1.2

- imageResize 图片缩放兼容移动端
- editor
  - 修复函数传参无传值时默认置为 false 导致报错问题
  - 修复 question、import 标签光标错误问题
- dialog
  - 渲染到 editor 中

## v1.1.1

- babel 配置
  - 添加可选链语法的转换

## v1.1.0

- editor
  - options 参数可传 quill 配置
  - question、import 等模块重写
  - wordCount 模块优化
  - 新增 pasteFromWord 模块
  - 使用 quill-blot-formatter 替代 quill-image-resize-module
  - 新增 imageUploader 模块
  - toolbar 参数支持二维数组
- webpack 配置
  - 修复开发环境下 debugger 失效问题

## v1.0.9

- editor
  - 新增 onLimit 参数 字数限制时触发
- webpack 配置
  - 解决热更新失效问题

## v1.0.8

- webpack 配置
  - 升级 v5
- 部分功能兼容 IE11

## v1.0.7

- editor
  - 修复编辑器内滚动时颜色选择器位置错误问题
  - 调整默认字体为 Arial
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
