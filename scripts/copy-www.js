/**
 * Copy web app assets to www/ for Capacitor mobile build
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');

const toCopy = [
  'index.html',
  'manifest.json',
  'sw.js',
  'css',
  'js',
  'images'
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true });
}
fs.mkdirSync(www, { recursive: true });

for (const item of toCopy) {
  const src = path.join(root, item);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(www, item));
    console.log('Copied:', item);
  }
}

console.log('www/ ready for Capacitor.');
