import QlQuill from "ql-quill";

const locale = {
  name: "zh_tw",
  插入重点: "插入重點",
  插入公式: "插入公式",
  取消: "取消",
  确定: "確定",
  恢复默认: "恢復默認",
};

const localeModule = QlQuill.import("modules/locale");

localeModule.locale(locale);

export default locale;
