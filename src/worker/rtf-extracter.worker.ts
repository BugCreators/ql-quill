export {};

addEventListener(
  "message",
  function (e) {
    postMessage(extractImageDataFromRtf(e.data));
    self.close();
  },
  false
);

interface Image {
  hex: string;
  type: string;
  base64: string;
}

function extractImageDataFromRtf(rtfData: string): Image[] {
  if (!rtfData) return [];

  const regexPictureHeaderOffice =
    /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
  const regexPictureHeaderWPS =
    /{\\pict[\s\S]+?(\\pngblip-?\d+)?(\\wmetafile8-?\d+)?{\\\*\\blipuid\s?[\da-fA-F]+[\s}]*?/;

  const regexPicture = new RegExp(
    `(?:(${regexPictureHeaderOffice.source})|(${regexPictureHeaderWPS.source}))([\\da-fA-F\\s]+)\\}`,
    "g"
  );

  const images = rtfData.match?.(regexPicture) || [];

  return images.reduce((result, image) => {
    let imageType = "";

    if (image.includes("\\pngblip")) {
      imageType = "image/png";
    } else if (image.includes("\\jpegblip")) {
      imageType = "image/jpeg";
    }

    const hex = image
      .replace(new RegExp(`${regexPictureHeaderOffice.source}|${regexPictureHeaderWPS.source}`), "")
      .replace(/[^\da-fA-F]/g, "");
    const base64 = "data:" + imageType + ";base64," + hex2Base64(hex);

    if (imageType) {
      result.push({
        hex: hex,
        type: imageType,
        base64: base64,
      });
    }

    return result;
  }, [] as Image[]);
}

function hex2Base64(hexString: string) {
  return btoa(
    hexString
      .match(/\w{2}/g)
      ?.map(char => String.fromCharCode(parseInt(char, 16)))
      ?.join("") || ""
  );
}
