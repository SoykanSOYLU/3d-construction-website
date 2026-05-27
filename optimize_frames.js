import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/frames';
const desktopDir = './public/frames/desktop';
const mobileDir = './public/frames/mobile';

// Create directories if they don't exist
if (!fs.existsSync(desktopDir)) {
  fs.mkdirSync(desktopDir, { recursive: true });
}
if (!fs.existsSync(mobileDir)) {
  fs.mkdirSync(mobileDir, { recursive: true });
}

// Get all frame files in the main public/frames folder (skip subdirectories)
const files = fs.readdirSync(inputDir)
  .filter(file => file.startsWith('frame_') && file.endsWith('.jpg'))
  .sort();

console.log(`Found ${files.length} frames to process.`);

async function processFile(file, index) {
  const inputPath = path.join(inputDir, file);
  const desktopPath = path.join(desktopDir, file);
  const mobilePath = path.join(mobileDir, file);

  try {
    // 1. Process Desktop (4K resolution, 92% quality, progressive)
    await sharp(inputPath)
      .jpeg({ quality: 92, progressive: true })
      .toFile(desktopPath);

    // 2. Process Mobile (1920x1080, 80% quality, progressive)
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'inside' })
      .jpeg({ quality: 80, progressive: true })
      .toFile(mobilePath);

    const progress = Math.round(((index + 1) / files.length) * 100);
    console.log(`[${progress}%] Processed ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}

async function run() {
  console.time('Optimization Time');
  // Process in chunks of 5 to avoid overloading RAM
  const concurrency = 5;
  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);
    await Promise.all(chunk.map((file, idx) => processFile(file, i + idx)));
  }
  console.timeEnd('Optimization Time');
  console.log('All frames optimized successfully!');
}

run();
