import QlQuill from "../index";
// @ts-ignore
import QuillBetterTable from "quill-better-table";

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
