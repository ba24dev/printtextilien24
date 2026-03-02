export function trimTransparentPixels(img: HTMLImageElement): {
  image: HTMLCanvasElement | HTMLImageElement;
  width: number;
  height: number;
} {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { image: img, width: img.width, height: img.height };

  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { image: img, width: img.width, height: img.height };
  }

  const trimmedW = maxX - minX + 1;
  const trimmedH = maxY - minY + 1;
  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = trimmedW;
  trimmedCanvas.height = trimmedH;
  const tctx = trimmedCanvas.getContext("2d");
  if (!tctx) return { image: img, width: img.width, height: img.height };
  tctx.putImageData(ctx.getImageData(minX, minY, trimmedW, trimmedH), 0, 0);
  return { image: trimmedCanvas, width: trimmedW, height: trimmedH };
}
