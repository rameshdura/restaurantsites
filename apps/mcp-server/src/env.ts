import dotenv from 'dotenv';
import path from 'path';

// Load environment variables relative to this directory at the very top
// so that local modules (like ./supabase) have access to them during import-time initialization.
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'apps/mcp-server/.env')
];

let envLoaded = false;
for (const p of envPaths) {
  const res = dotenv.config({ path: p });
  if (!res.error) {
    console.log(`Loaded environment from: ${p}`);
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  console.warn('Warning: Could not load .env file from any expected path.');
}
