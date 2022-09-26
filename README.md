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

## [配置示例](https://github.com/BugCreators/ql-quill/blob/master/index.html)

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

#### image.drop `boolean`

是否开启拖拽上传

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

### locale `preset: string, object?: Record<string, string`

切换当前实例语言

### setContents `(value: string | Delta): Delta`

设置内容

### getHTML `() => string`

获取内容 HTML 字符串

### insertImage `(src: string, latex?) => void`

插入图片

更多配置及方法可见[Quill](https://quilljs.com/docs/quickstart/)
