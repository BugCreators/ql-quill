import QlQuill from "./quill";

import Dialog from "./modules/dialog";
import BlotFormatter from "./modules/blotFormatter";
import Locale from "./modules/locale";
import ImageUploader from "./modules/imageUploader";
import PasteFromWord from "./modules/pasteFromWord";
import WordCount from "./modules/wordCount";
import Import from "./modules/import";
import Question from "./modules/question";
import Formula from "./modules/formula";
import Table from "./modules/table";
import SnowTheme from "./themes/snow";

// 全量入口：注册所有模块与主题，体积换易用性；
// 只需要基础编辑能力时可直接用 src/quill 或自行按需注册。
QlQuill.register(
  {
    "modules/better-table": Table,
    "modules/dialog": Dialog,
    "modules/uploader": ImageUploader,
    "modules/blotFormatter": BlotFormatter,
    "modules/locale": Locale,
    "modules/pasteFromWord": PasteFromWord,
    "modules/wordCount": WordCount,
    "modules/question": Question,
    "modules/import": Import,
    "modules/formula": Formula,

    "themes/snow": SnowTheme,
  },
  true,
);

export { default as Quill } from "quill";
export { default as QlQuill } from "./quill";
export * from "./types";

export default QlQuill;
