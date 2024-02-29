import Quill from "quill";
import BetterTable from "quill-better-table";

import {
  TableCol,
  TableColGroup,
  TableCellLine,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  TableViewWrapper as TableViewWrapperBlot,
  rowId,
  cellId,
} from "quill-better-table/src/formats/table";

import Header from "quill-better-table/src/formats/header";

const Delta = Quill.import("delta");

class TableViewWrapper extends TableViewWrapperBlot {
  checkMerge() {
    console.log(
      this.next !== null &&
        this.next.statics.blotName === this.statics.blotName,
      this
    );

    return (
      this.next !== null && this.next.statics.blotName === this.statics.blotName
    );
  }
}

TableViewWrapper.allowedChildren = [TableContainer];
TableContainer.requiredContainer = TableViewWrapper;

TableCell.allowedChildren = [TableViewWrapper, TableCellLine, Header];

class QuillBetterTable extends BetterTable {
  static register() {
    Quill.register(TableCol, true);
    Quill.register(TableColGroup, true);
    Quill.register(TableCellLine, true);
    Quill.register(TableCell, true);
    Quill.register(TableRow, true);
    Quill.register(TableBody, true);
    Quill.register(TableContainer, true);
    Quill.register(TableViewWrapper, true);
    Quill.register(TableViewWrapper, true);
    // register customized Header，overwriting quill built-in Header
    // Quill.register('formats/header', Header, true);
  }

  insertTable(rows, columns) {
    const range = this.quill.getSelection(true);
    if (range == null) return;
    let delta = new Delta().retain(range.index);

    delta.insert("\n");
    // insert table column
    delta = new Array(columns).fill("\n").reduce((memo, text) => {
      memo.insert(text, { "table-col": true });
      return memo;
    }, delta);
    // insert table cell line with empty line
    delta = new Array(rows).fill(0).reduce(memo => {
      let tableRowId = rowId();
      return new Array(columns).fill("\n").reduce((memo, text) => {
        memo.insert(text, {
          "table-cell-line": { row: tableRowId, cell: cellId() },
        });
        return memo;
      }, memo);
    }, delta);

    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index + columns + 1, Quill.sources.API);
  }
}

export default QuillBetterTable;
