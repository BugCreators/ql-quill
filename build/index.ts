import { rollup } from "rollup";
import configFactory from "./rollup.config";
import type { FactoryConfig } from "./rollup.config";
import { readdir } from "fs";
import { promisify } from "util";
import { join } from "path";

const formatName = (n: string) => n.replace(/\.js/, "");

const promisifyReadDir = promisify(readdir);

const localePath = join(__dirname, "../src/locale");

async function build(option: FactoryConfig) {
  const bundle = await rollup(option.input);
  await bundle.write(option.output);
}

(async () => {
  try {
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    // We use await-in-loop to make rollup run sequentially to save on RAM
    const locales = await promisifyReadDir(localePath);
    for (const l of locales) {
      // run builds sequentially to limit RAM usage
      await build(
        configFactory({
          input: `./src/locale/${l}`,
          fileName: `./locale/${l}`.replace("ts", "js"),
          name: `ql_quill_locale_${formatName(l)}`,
        })
      );
    }
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
  }
})();
