import Quill from "quill";

const BaseClipboard = Quill.import("modules/clipboard");

class Clipboard extends BaseClipboard {
  onPaste(e) {
    setTimeout(() => {
      [...this.container.querySelectorAll("V\\:IMAGEDATA")].forEach(el => {
        const img = document.createElement("img");

        img.setAttribute("src", el.getAttribute("src"));
        img.setAttribute("width", pt2Px(el.parentNode.style.width));
        img.setAttribute("height", pt2Px(el.parentNode.style.height));

        el.parentNode.parentNode.replaceChild(img, el.parentNode);
      });
    });
    super.onPaste(e);

    const rtfText = e.clipboardData.getData("text/rtf");
    this.rtfImages = extractImageDataFromRtf(rtfText);
  }
}

const Module = Quill.import("core/module");
const Delta = Quill.import("delta");

class PasteFromWord extends Module {
  static register() {
    Quill.register({ "modules/clipboard": Clipboard }, true);
  }

  constructor(quill, options) {
    super(quill, options);

    const clipboard = quill.getModule("clipboard");

    clipboard.addMatcher("V\\:SHAPETYPE", (node, delta) => new Delta());

    clipboard.addMatcher("IMG", (node, delta) => {
      const src = node.getAttribute("src");

      if (src && /^file:\/\/[\s\S]+/.test(src) && clipboard.rtfImages?.length) {
        const image = clipboard.rtfImages.shift();

        return new Delta().insert({
          image: {
            src: `data:${image.type};base64,${hex2Base64(image.hex)}`,
            width: node.getAttribute("width"),
            height: node.getAttribute("height"),
          },
        });
      }

      return delta;
    });

    clipboard.addMatcher("IMG", (node, delta) => {
      // console.log(Quill.query(node));

      return delta;
    });
  }
}

function extractImageDataFromRtf(rtfData) {
  if (!rtfData) return [];

  const regexPictureHeaderOffice =
    /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
  const regexPictureHeaderWPS =
    /{\\pict[\s\S]+?(\\pngblip-?\d+)?(\\wmetafile8-?\d+)?{\\\*\\blipuid\s?[\da-fA-F]+[\s}]*?/;

  const regexPicture = new RegExp(
    `(?:(${regexPictureHeaderOffice.source})|(${regexPictureHeaderWPS.source}))([\\da-fA-F\\s]+)\\}`,
    "g"
  );

  const images = rtfData.match(regexPicture) || [];

  return images.reduce((result, image) => {
    let imageType = false;

    if (image.includes("\\pngblip")) {
      imageType = "image/png";
    } else if (image.includes("\\jpegblip")) {
      imageType = "image/jpeg";
    }

    if (imageType) {
      result.push({
        hex: image
          .replace(
            new RegExp(
              `${regexPictureHeaderOffice.source}|${regexPictureHeaderWPS.source}`
            ),
            ""
          )
          .replace(/[^\da-fA-F]/g, ""),
        type: imageType,
      });
    }

    return result;
  }, []);
}

function pt2Px(string) {
  let number = string.match(/[0-9]+(\.?[0-9]+)?/)[0];
  if (string.indexOf("pt") !== -1) number = (number / 72) * 96;
  return number;
}

function hex2Base64(hexString) {
  return btoa(
    hexString
      .match(/\w{2}/g)
      .map(char => String.fromCharCode(parseInt(char, 16)))
      .join("")
  );
}

export default PasteFromWord;
