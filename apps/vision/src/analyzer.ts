export type LocalImageAnalysis = {
  kind: 'image';
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  orientation: 'portrait' | 'landscape' | 'square';
  averageLuma: number;
  dominantColors: string[];
};

export type LocalVideoAnalysis = {
  kind: 'video';
  name: string;
  width: number;
  height: number;
  duration: number;
  aspectRatio: string;
  orientation: 'portrait' | 'landscape' | 'square';
  sampleTimes: number[];
};

export type LocalMediaAnalysis = LocalImageAnalysis | LocalVideoAnalysis;

function ratio(width: number, height: number) {
  if (!width || !height) return 'unknown';
  const common = [
    [16, 9],
    [9, 16],
    [4, 5],
    [5, 4],
    [1, 1],
    [3, 2],
    [2, 3],
  ];
  const value = width / height;
  const match = common
    .map(([w, h]) => ({ label: `${w}:${h}`, delta: Math.abs(value - w / h) }))
    .sort((a, b) => a.delta - b.delta)[0];
  return match.delta < 0.07 ? match.label : `${Math.round(width)}:${Math.round(height)}`;
}

function orientation(width: number, height: number) {
  if (Math.abs(width - height) <= Math.max(width, height) * 0.04) return 'square' as const;
  return width > height ? ('landscape' as const) : ('portrait' as const);
}

function channelHex(value: number) {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
}

function rgbHex(r: number, g: number, b: number) {
  return `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
}

export async function analyzeImage(file: File): Promise<LocalImageAnalysis> {
  const bitmap = await createImageBitmap(file);
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  const max = 256;
  const scale = Math.min(1, max / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas analysis is unavailable.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, width, height);
  let lumaTotal = 0;
  let count = 0;
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 20) continue;
    lumaTotal += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    count += 1;
    const qr = Math.min(255, Math.round(r / 48) * 48);
    const qg = Math.min(255, Math.round(g / 48) * 48);
    const qb = Math.min(255, Math.round(b / 48) * 48);
    const key = `${qr}-${qg}-${qb}`;
    const item = buckets.get(key) ?? { r: qr, g: qg, b: qb, count: 0 };
    item.count += 1;
    buckets.set(key, item);
  }

  const dominantColors = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => rgbHex(item.r, item.g, item.b));

  return {
    kind: 'image',
    name: file.name,
    width: sourceWidth,
    height: sourceHeight,
    aspectRatio: ratio(sourceWidth, sourceHeight),
    orientation: orientation(sourceWidth, sourceHeight),
    averageLuma: Math.round(count ? lumaTotal / count : 0),
    dominantColors,
  };
}

export async function analyzeVideo(file: File): Promise<LocalVideoAnalysis> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Could not read video metadata.'));
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const sampleCount = Math.max(3, Math.min(12, Math.ceil(duration / 8)));
    const sampleTimes = Array.from({ length: sampleCount }, (_, index) =>
      Number((((index + 1) * duration) / (sampleCount + 1)).toFixed(2)),
    );

    return {
      kind: 'video',
      name: file.name,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number(duration.toFixed(2)),
      aspectRatio: ratio(video.videoWidth, video.videoHeight),
      orientation: orientation(video.videoWidth, video.videoHeight),
      sampleTimes,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function analyzeMedia(file: File) {
  if (file.type.startsWith('image/')) return analyzeImage(file);
  if (file.type.startsWith('video/')) return analyzeVideo(file);
  throw new Error('Choose an image or video file.');
}
