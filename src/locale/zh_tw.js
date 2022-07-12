import QlQuill from "ql-quill";

const locale = {
  name: "zh_tw",
  插入重点: "插入重點",
  插入公式: "插入公式",
  取消: "取消",
  确定: "確定",
  重置: "重置",
};

const localeModule = QlQuill.import("modules/locale");

localeModule.locale(locale, null, true);

export default locale;
