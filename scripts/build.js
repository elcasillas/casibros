const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'dist');
const COPY_ITEMS = ['index.html', 'images'];

function copyRecursive(source, destination) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

try {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const item of COPY_ITEMS) {
    const source = path.join(process.cwd(), item);
    const destination = path.join(OUTPUT_DIR, item);
    copyRecursive(source, destination);
  }

  console.log(`Build output written to ${OUTPUT_DIR}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
