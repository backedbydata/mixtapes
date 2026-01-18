import { supabase } from '../lib/supabase';

export interface OcrResult {
  rawText: string;
  lines: OcrLine[];
  confidence: number;
}

export interface OcrLine {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

async function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed.split(',')[1]);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export async function performOcr(imageDataUrl: string): Promise<OcrResult> {
  let base64Data: string;

  try {
    base64Data = await compressImage(imageDataUrl);
  } catch {
    base64Data = imageDataUrl.split(',')[1];
  }

  if (!base64Data) {
    throw new Error('Invalid image data');
  }

  const { data, error } = await supabase.functions.invoke('ocr-scan', {
    body: { image: base64Data },
  });

  if (error) {
    console.error('OCR invoke error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }

  if (data?.error) {
    console.error('OCR response error:', data.error);
    throw new Error(`OCR failed: ${data.error}`);
  }

  return data;
}

export async function uploadMixtapeImage(
  userId: string,
  file: File,
  side?: 'A' | 'B'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-side-${side || 'main'}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('mixtape-images')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('mixtape-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
