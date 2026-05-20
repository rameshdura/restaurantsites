#!/usr/bin/env node

/**
 * CLI tool to remove a restaurant site and unregister it.
 * Usage: node scripts/remove-restaurant.mjs <restaurant-slug>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define directories using ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

// Get slug from CLI args
const slug = process.argv[2];

if (!slug) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Please specify a restaurant slug.');
  console.error('Usage: npm run remove-restaurant <slug>');
  console.error('Example: npm run remove-restaurant mybakery');
  process.exit(1);
}

// Define targets
const targetRestDir = path.join(workspaceRoot, 'apps', 'web', 'restaurants', slug);
const targetPublicImagesDir = path.join(workspaceRoot, 'apps', 'web', 'public', 'images', 'restaurants', slug);
const proxyPath = path.join(workspaceRoot, 'apps', 'web', 'proxy.ts');

console.log(`Removing restaurant "${slug}"...`);

try {
  // 1. Remove restaurant folder
  if (fs.existsSync(targetRestDir)) {
    console.log(`- Removing restaurant folder: ${targetRestDir}`);
    fs.rmSync(targetRestDir, { recursive: true, force: true });
    console.log('\x1b[32m%s\x1b[0m', `✔ Removed restaurant folder successfully!`);
  } else {
    console.log(`- Restaurant folder "${slug}" not found at ${targetRestDir}`);
  }

  // 2. Remove public image assets
  if (fs.existsSync(targetPublicImagesDir)) {
    console.log(`- Removing public image assets: ${targetPublicImagesDir}`);
    fs.rmSync(targetPublicImagesDir, { recursive: true, force: true });
    console.log('\x1b[32m%s\x1b[0m', `✔ Removed public image assets successfully!`);
  } else {
    console.log(`- Public image assets for "${slug}" not found at ${targetPublicImagesDir}`);
  }

  // 3. Update proxy.ts to unregister the slug
  if (fs.existsSync(proxyPath)) {
    console.log('- Unregistering slug in proxy.ts...');
    const proxyContent = fs.readFileSync(proxyPath, 'utf8');
    const validSlugsRegex = /(const validSlugs = \[[^\]]*\])/;
    const match = proxyContent.match(validSlugsRegex);

    if (match) {
      const arrayMatch = match[1].match(/\[([^\]]*)\]/);
      if (arrayMatch) {
        const existingSlugsStr = arrayMatch[1];
        const existingSlugs = existingSlugsStr
          .split(',')
          .map(s => s.trim().replace(/['"]/g, ''))
          .filter(Boolean);

        if (existingSlugs.includes(slug)) {
          const updatedSlugs = existingSlugs.filter(s => s !== slug);
          const newSlugsLine = `const validSlugs = [${updatedSlugs.map(s => `"${s}"`).join(', ')}]`;
          const updatedProxyContent = proxyContent.replace(match[1], newSlugsLine);
          
          fs.writeFileSync(proxyPath, updatedProxyContent, 'utf8');
          console.log('\x1b[32m%s\x1b[0m', `✔ Unregistered "${slug}" in proxy.ts successfully!`);
        } else {
          console.log(`- Slug "${slug}" was not found in proxy.ts`);
        }
      }
    } else {
      console.warn('\x1b[33m%s\x1b[0m', 'Warning: Could not parse validSlugs array in proxy.ts');
    }
  } else {
    console.warn('\x1b[33m%s\x1b[0m', `Warning: proxy.ts not found at ${proxyPath}`);
  }

  console.log('\x1b[32m%s\x1b[0m', `\n🎉 Successfully removed and unregistered "${slug}"!`);

} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', 'An error occurred during removal:', err);
  process.exit(1);
}
