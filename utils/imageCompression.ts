const MAX_BYTES = 3 * 1024 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) {
    return file;
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedTypes.has(file.type)) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const outputType = file.type;
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, outputType, quality);

  // PNG compression is lossless in canvas, so repeated quality reduction won't help.
  if (outputType !== "image/png") {
    while (blob.size > MAX_BYTES && quality > 0.5) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, outputType, quality);
    }
  }

  if (blob.size > MAX_BYTES) {
    return file;
  }

  return new File([blob], file.name, { type: outputType, lastModified: Date.now() });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}
