// @ts-ignore
import QuillBetterTable from "quill-better-table";
import type QlQuill from "../quill";

/** better-table 的模块配置（右键菜单文案） */
export const TABLE_MODULE_OPTIONS = {
  operationMenu: {
    items: {
      insertColumnRight: { text: "右插入列" },
      insertColumnLeft: { text: "左插入列" },
      insertRowUp: { text: "上插入行" },
      insertRowDown: { text: "下插入行" },
      mergeCells: { text: "合并单元格" },
      unmergeCells: { text: "取消合并" },
      deleteColumn: { text: "删除列" },
      deleteRow: { text: "删除行" },
      deleteTable: { text: "删除表格" },
    },
  },
};

/** 表格内的回车 / Tab 等按键需要交给 better-table 处理 */
export const TABLE_KEYBOARD_BINDINGS = QuillBetterTable.keyboardBindings;

class Table extends QuillBetterTable {
  declare options: string;
  declare quill: QlQuill;

  constructor(quill: QlQuill, options: string) {
    super(quill, options);

    quill.getModule("toolbar").addHandler("table", this.insert);
  }

  insert = () => {
    // @ts-ignore
    this.insertTable(3, 3);
  };
}

export default Table;
