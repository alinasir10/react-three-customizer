export const createImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};

export const getCroppedImg = async (imageSrc, crop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => resolve(fileReader.result);
      fileReader.readAsDataURL(blob);
    }, "image/png");
  });
};
