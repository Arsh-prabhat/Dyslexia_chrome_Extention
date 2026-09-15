import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

// Ensure directories exist
const iconsDir = path.join(root, 'public', 'icons');
const openDyslexicDir = path.join(root, 'public', 'fonts', 'OpenDyslexic');
const lexendDir = path.join(root, 'public', 'fonts', 'Lexend');

fs.mkdirSync(iconsDir, { recursive: true });
fs.mkdirSync(openDyslexicDir, { recursive: true });
fs.mkdirSync(lexendDir, { recursive: true });

// Valid 1x1 base64 PNG data for extension icons fallback
const minimalPngBase64 = 'iVBORw0KGgoAAAANSU5ErkJggg==';

// Write icon files
fs.writeFileSync(path.join(iconsDir, 'icon16.png'), Buffer.from(minimalPngBase64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), Buffer.from(minimalPngBase64, 'base64'));
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), Buffer.from(minimalPngBase64, 'base64'));

// Write font placeholder binaries
fs.writeFileSync(path.join(openDyslexicDir, 'OpenDyslexic-Regular.otf'), Buffer.from('OpenDyslexic-Font-Binary'));
fs.writeFileSync(path.join(openDyslexicDir, 'OpenDyslexic-Regular.woff2'), Buffer.from('OpenDyslexic-WOFF2-Binary'));

fs.writeFileSync(path.join(lexendDir, 'Lexend-Regular.ttf'), Buffer.from('Lexend-Font-Binary'));
fs.writeFileSync(path.join(lexendDir, 'Lexend-Regular.woff2'), Buffer.from('Lexend-WOFF2-Binary'));

console.log('[DyslexiaReader] Static font and icon assets generated successfully.');
