#!/usr/bin/env node

/**
 * CLI tool to clone the secure restaurant template and register it.
 * Usage: node scripts/create-restaurant.mjs <new-restaurant-slug>
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
  console.error('Usage: npm run create-restaurant <slug>');
  console.error('Example: npm run create-restaurant mybakery');
  process.exit(1);
}

// Validate slug format (alphanumeric and hyphens only)
const slugRegex = /^[a-z0-9-]+$/;
if (!slugRegex.test(slug)) {
  console.error('\x1b[31m%s\x1b[0m', `Error: Invalid slug format "${slug}".`);
  console.error('Slugs must contain only lowercase letters, numbers, and hyphens (e.g., "my-bakery-123").');
  process.exit(1);
}

// Define secure template source paths
const boilerplateDir = path.join(workspaceRoot, 'templates', 'restaurant-boilerplate');
const templateDataJson = path.join(boilerplateDir, 'data.json');
const templateImagesDir = path.join(boilerplateDir, 'images');

// Define targets
const targetRestDir = path.join(workspaceRoot, 'apps', 'web', 'restaurants', slug);
const targetRestImagesDir = path.join(targetRestDir, 'images');
const targetPublicImagesDir = path.join(workspaceRoot, 'apps', 'web', 'public', 'images', 'restaurants', slug);
const proxyPath = path.join(workspaceRoot, 'apps', 'web', 'proxy.ts');

console.log(`Cloning restaurant "${slug}" from secure boilerplate...`);

// 1. Verify template files exist in secure folder
if (!fs.existsSync(templateDataJson)) {
  console.error('\x1b[31m%s\x1b[0m', `Error: Master configuration file not found at ${templateDataJson}`);
  process.exit(1);
}
if (!fs.existsSync(templateImagesDir)) {
  console.error('\x1b[31m%s\x1b[0m', `Error: Master asset library not found at ${templateImagesDir}`);
  process.exit(1);
}

// 2. Verify target doesn't already exist
if (fs.existsSync(targetRestDir)) {
  console.error('\x1b[31m%s\x1b[0m', `Error: Restaurant folder "${slug}" already exists at ${targetRestDir}`);
  process.exit(1);
}

try {
  // 3. Create target restaurant directories
  console.log(`- Creating restaurant folder: ${targetRestDir}`);
  fs.mkdirSync(targetRestDir, { recursive: true });

  // 4. Copy data.json
  console.log(`- Copying site configuration file...`);
  fs.copyFileSync(templateDataJson, path.join(targetRestDir, 'data.json'));

  // 5. Copy images to local restaurants folder
  console.log(`- Copying local images folder to: ${targetRestImagesDir}`);
  fs.cpSync(templateImagesDir, targetRestImagesDir, { recursive: true });

  // 6. Copy images to public Next.js assets folder
  console.log(`- Copying public image assets to: ${targetPublicImagesDir}`);
  fs.cpSync(templateImagesDir, targetPublicImagesDir, { recursive: true });

  // 7. Customize the new data.json file
  const dataJsonPath = path.join(targetRestDir, 'data.json');
  if (fs.existsSync(dataJsonPath)) {
    console.log('- Customizing data.json with new slug and image asset paths...');
    let dataContent = fs.readFileSync(dataJsonPath, 'utf8');

    // Human-friendly title formatting (e.g. "my-bakery" -> "My Bakery")
    const formattedName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Replace uid and image path keys
    dataContent = dataContent
      .replace(/"uid":\s*"ramen-taro"/g, `"uid": "${slug}"`)
      .replace(/"uid":\s*"ramen_taro"/g, `"uid": "${slug}"`)
      .replace(/\/images\/restaurants\/ramen-taro\//g, `/images/restaurants/${slug}/`);

    // Replace occurrences of "Ramen Taro" with the formatted name
    dataContent = dataContent.replace(/Ramen Taro/g, formattedName);

    fs.writeFileSync(dataJsonPath, dataContent, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', `✔ Customized data.json successfully!`);
  }

  // 8. Update proxy.ts to register the new slug
  if (fs.existsSync(proxyPath)) {
    console.log('- Registering slug in proxy.ts...');
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

        if (!existingSlugs.includes(slug)) {
          existingSlugs.push(slug);
          const newSlugsLine = `const validSlugs = [${existingSlugs.map(s => `"${s}"`).join(', ')}]`;
          const updatedProxyContent = proxyContent.replace(match[1], newSlugsLine);
          
          fs.writeFileSync(proxyPath, updatedProxyContent, 'utf8');
          console.log('\x1b[32m%s\x1b[0m', `✔ Registered "${slug}" in proxy.ts successfully!`);
        } else {
          console.log(`- Slug "${slug}" is already registered in proxy.ts`);
        }
      }
    } else {
      console.warn('\x1b[33m%s\x1b[0m', 'Warning: Could not parse validSlugs array in proxy.ts');
    }
  } else {
    console.warn('\x1b[33m%s\x1b[0m', `Warning: proxy.ts not found at ${proxyPath}`);
  }

  console.log('\x1b[32m%s\x1b[0m', `\n🎉 Successfully created and registered "${slug}"!`);
  console.log(`You can now visit http://localhost:3000/${slug} (with local dev server running) to see it.`);

} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', 'An error occurred during cloning:', err);
  process.exit(1);
}
