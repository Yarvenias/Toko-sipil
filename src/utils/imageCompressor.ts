/**
 * Utility to compress and resize images client-side before uploading.
 * This resolves the issue with high-resolution mobile phone photos causing
 * 413 Payload Too Large errors or high memory usage in persistent db.json.
 */
export const compressAndResizeImage = (
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Verify it is actually an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas yang dipilih bukan gambar valid.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio compliant downscaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context acquisition fails
          resolve(event.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to highly optimized data URL (JPEG/0.75 quality)
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (e) {
          // Cross-origin fallback or standard fallback
          resolve(event.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error('Gagal membaca data gambar untuk kompresi.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas gambar dari media penyimpanan.'));
    };

    reader.readAsDataURL(file);
  });
};
