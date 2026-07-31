import Toolbar from "quill/modules/toolbar";
import type { Range } from "quill/core/selection";
import QlQuill from "../index";

const baseToolbar = QlQuill.import("modules/toolbar") as typeof Toolbar;

class CustomToolbar extends baseToolbar {
  update(range: Range | null) {
    super.update(range);

    const importPair = this.controls.find(pair => pair[0] === "import");

    if (importPair) {
      const input = importPair[1];
      const delta =
        range == null
          ? null
          : this.quill.getContents(
              range.length === 0 ? range.index - 1 : range.index,
              range.length || 1,
            );

      if (
        delta?.ops.some(
          op => typeof op.insert !== "string" && !!op.insert?.import,
        )
      ) {
        input.classList.toggle("ql-active", true);
        input.setAttribute("aria-pressed", "true");
      } else {
        input.classList.remove("ql-active");
        input.setAttribute("aria-pressed", "false");
      }
    }
  }
}

export default CustomToolbar;
