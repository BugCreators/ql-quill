import QlQuill from "./src/index";

import Dialog from "./src/modules/dialog";

import BlotFormatter from "./src/modules/blotFormatter";

import SnowTheme from "./src/themes/snow";

import Locale from "./src/modules/locale";

import ImageUploader from "./src/modules/imageUploader";
import PasteFromWord from "./src/modules/pasteFromWord";
import WordCount from "./src/modules/wordCount";
import Import from "./src/modules/import";
import Question from "./src/modules/question";
import Formula from "./src/modules/formula";

QlQuill.register(
  {
    "modules/dialog": Dialog,
    "modules/imageUploader": ImageUploader,
    "modules/blotFormatter": BlotFormatter,
    "modules/locale": Locale,
    "modules/pasteFromWord": PasteFromWord,
    "modules/wordCount": WordCount,
    "modules/question": Question,
    "modules/import": Import,
    "modules/formula": Formula,

    "themes/snow": SnowTheme,
  },
  true
);

// quill
export { default as Quill } from "quill";

export * from "./src/index";
export * from "./src/types";
export * from "./src/quill";

// ql-quill
export default QlQuill;
