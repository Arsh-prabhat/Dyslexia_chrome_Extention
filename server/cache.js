import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, 'data');
const cacheFilePath = path.join(cacheDir, 'cache.json');

// Memory cache backed by disk JSON database
let cacheMap = new Map();

function initCache() {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (fs.existsSync(cacheFilePath)) {
      const data = fs.readFileSync(cacheFilePath, 'utf8');
      const json = JSON.parse(data);
      cacheMap = new Map(Object.entries(json));
      console.log(`[DyslexiaReader Cache] Loaded ${cacheMap.size} cached entries from database.`);
    }
  } catch (err) {
    console.warn('[DyslexiaReader Cache] Failed to load cache file, starting fresh:', err);
    cacheMap = new Map();
  }
}

function persistCache() {
  try {
    const obj = Object.fromEntries(cacheMap.entries());
    fs.writeFileSync(cacheFilePath, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error('[DyslexiaReader Cache] Failed to persist cache to disk:', err);
  }
}

function getHash(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

initCache();

export const CacheEngine = {
  get(text) {
    const hash = getHash(text);
    return cacheMap.get(hash) || null;
  },

  set(text, simplifiedText) {
    const hash = getHash(text);
    cacheMap.set(hash, simplifiedText);
    persistCache();
  },

  size() {
    return cacheMap.size;
  },

  clear() {
    cacheMap.clear();
    persistCache();
  }
};
