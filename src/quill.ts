import Quill from "quill";
import type { Delta, Op } from "quill/core";
import type { Range } from "quill/core/selection";
import type IconType from "quill/ui/icons";
import type Toolbar from "quill/modules/toolbar";

import type { QlExpandedOptions, QlOptions, QlQuillOptions } from "./types";
import {
  CUSTOM_OPTIONS,
  CUSTOM_TOOLS,
  createDefaultConfig,
  extractConfig,
} from "./core/options";
import { applyModuleConfig } from "./core/expand-config";

import type Dialog from "./modules/dialog";
import type ImageUploader from "./modules/imageUploader";
import type Locale from "./modules/locale";
import type WordCount from "./modules/wordCount";

import BlotFormatter from "./modules/blotFormatter";
import ImageBlot from "./blots/image";

import cleanIcon from "@icons/clean.svg?raw";
import importIcon from "@icons/spot.svg?raw";

import "./assets/index.styl";

const Icons = Quill.import("ui/icons") as typeof IconType;
Object.assign(Icons, { clean: cleanIcon, import: importIcon });

Quill.register(ImageBlot, true);
Quill.register("modules/blotFormatter2", BlotFormatter);

interface QlQuill {
  getModule(name: "dialog"): Dialog;
  getModule(name: "toolbar"): Toolbar;
  getModule(name: "wordCount"): WordCount;
  getModule(name: "locale"): Locale;
  getModule(name: "uploader"): ImageUploader;
  getModule(name: string): unknown;
}

class QlQuill extends Quill {
  /** 由 toolbar 决定是否启用的自定义按钮 */
  static readonly CUSTOM_TOOLS = CUSTOM_TOOLS;
  /** 需要从 Quill 原生 options 中剥离出来的自定义选项 */
  static readonly CUSTOM_OPTIONS = CUSTOM_OPTIONS;

  qlOptions: QlOptions;
  declare options: QlExpandedOptions;
  prevSelection?: Range | null;
  isFocused = false;
  focusSyncTimer?: number;

  constructor(container: string | HTMLElement, options: QlQuillOptions = {}) {
    const qlOptions = extractConfig(options);

    super(
      container,
      createDefaultConfig(options, qlOptions) as unknown as ConstructorParameters<
        typeof Quill
      >[1],
    );
    // 阻止谷歌翻译输入框
    this.container.classList.add("notranslate");

    this.qlOptions = qlOptions;
    this.expandConfig(this.options, qlOptions);

    this.onEditorChange();
    this.registerFocusListener();
    this.registerCompositionListener();

    qlOptions.value && this.setContents(qlOptions.value);
  }

  /** 按实际用到的按钮补齐模块配置 */
  expandConfig(
    options: QlExpandedOptions,
    qlOptions: QlOptions,
  ): QlExpandedOptions {
    return applyModuleConfig(this, options, qlOptions);
  }

  onEditorChange() {
    this.on("editor-change", (...args) => {
      if (args[0] === "text-change") {
        this.onEditorChangeText(args[1]);
      } else if (args[0] === "selection-change") {
        this.onEditorChangeSelection(args[1]);
      }
    });
  }

  onEditorChangeText(delta: Delta) {
    if (this.getModule("wordCount")) return;

    this.qlOptions.onChange?.(this.root.innerHTML, delta);
  }

  onEditorChangeSelection(nextSelection: Range | null) {
    this.prevSelection = nextSelection;
    this.requestFocusSync();
  }

  registerFocusListener() {
    const toolbar = this.getModule("toolbar");
    const syncFocusState = () => this.requestFocusSync();

    this.container.addEventListener("focusin", syncFocusState);
    this.container.addEventListener("focusout", syncFocusState);
    toolbar.container?.addEventListener("focusin", syncFocusState);
    toolbar.container?.addEventListener("focusout", syncFocusState);
  }

  registerCompositionListener() {
    this.root.addEventListener("compositionstart", this.handleCompositionStart);
    this.root.addEventListener("compositionend", this.handleCompositionEnd);
  }

  handleCompositionStart = () => {
    this.root.classList.remove("ql-blank");
  };

  /** 中文输入法合成期间 quill 不会维护 ql-blank，合成结束后补一次 */
  handleCompositionEnd = () => {
    const delta = this.getContents();
    const isBlank = delta.ops.length === 1 && delta.ops[0].insert === "\n";

    if (isBlank) {
      this.root.classList.add("ql-blank");
    }
  };

  requestFocusSync() {
    if (typeof this.focusSyncTimer === "number") {
      window.clearTimeout(this.focusSyncTimer);
    }

    // 等待浏览器完成焦点切换，再读取 activeElement，避免 toolbar/tooltip 点击误判失焦。
    this.focusSyncTimer = window.setTimeout(() => {
      this.focusSyncTimer = undefined;
      this.syncFocusState();
    }, 0);
  }

  syncFocusState() {
    const nextFocused = this.isFocusWithinEditor();

    if (nextFocused === this.isFocused) return;

    this.isFocused = nextFocused;

    const toolbar = this.getModule("toolbar");

    this.container.classList.toggle("on-focus", nextFocused);
    toolbar.container?.classList.toggle("on-focus", nextFocused);

    if (nextFocused) {
      this.qlOptions.onFocus?.();
    } else {
      this.qlOptions.onBlur?.();
    }
  }

  isFocusWithinEditor() {
    const toolbar = this.getModule("toolbar");
    const activeElement = document.activeElement;

    if (!(activeElement instanceof Node)) return false;

    return (
      this.container.contains(activeElement) ||
      !!toolbar.container?.contains(activeElement)
    );
  }

  locale(preset: string, object?: Record<string, string>) {
    const locale = this.getModule("locale");

    return locale.locale(preset, object);
  }

  setContents(value: string | Delta | Op[]) {
    const sel = this.prevSelection;
    let delta: Delta;

    if (typeof value === "string") {
      this.clipboard.dangerouslyPasteHTML(value);

      delta = this.getContents();
    } else {
      delta = super.setContents(value);
    }
    postpone(() => this.setEditorSelection(sel));

    return delta;
  }

  getHTML(): string {
    return this.root.innerHTML;
  }

  setEditorSelection(range?: Range | null) {
    this.prevSelection = range;
    if (range) {
      const length = this.getLength();
      range.index = Math.max(0, Math.min(range.index, length - 1));
      range.length = Math.max(
        0,
        Math.min(range.length, length - 1 - range.index),
      );
      this.setSelection(range);
    }
  }

  insertImage(
    src: string,
    latex = "",
    attributes: Record<string, string | number> = {},
  ) {
    const uploader = this.getModule("uploader");

    return (uploader.constructor as typeof ImageUploader).insertImage.call(
      this,
      src,
      {
        "data-latex": latex,
        ...attributes,
      },
    );
  }
}

function postpone(fn: () => void) {
  Promise.resolve().then(fn);
}

export default QlQuill;
