import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const manifestPath = path.join(root, 'manifest.json');
const distManifestPath = path.join(root, 'dist', 'manifest.json');

// Ensure dist directory exists
if (!fs.existsSync(path.join(root, 'dist'))) {
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
}

// Read manifest.json
const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
const manifestObj = JSON.parse(manifestRaw);

// Update side_panel path if needed
manifestObj.side_panel = {
  default_path: 'src/sidepanel/index.html'
};

fs.writeFileSync(distManifestPath, JSON.stringify(manifestObj, null, 2));

console.log('[DyslexiaReader] Copied manifest.json to dist/manifest.json successfully.');
