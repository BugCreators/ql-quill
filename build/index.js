const rollup = require("rollup");
const configFactory = require("./rollup.config");
const fs = require("fs");
const util = require("util");
const path = require("path");

const formatName = n => n.replace(/\.js/, "");

const { promisify } = util;

const promisifyReadDir = promisify(fs.readdir);

const localePath = path.join(__dirname, "../src/locale");

async function build(option) {
  const bundle = await rollup.rollup(option.input);
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
          fileName: `./locale/${l}`,
          name: `ql_quill_locale_${formatName(l)}`,
        })
      );
    }
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
  }
})();
