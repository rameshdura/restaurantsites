import fs from 'fs';
import path from 'path';
import { RestaurantData } from './types';

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const getRestaurantData = async (slug: string): Promise<RestaurantData> => {
  const localDir = path.join(DATA_DIR, slug);
  const localFile = path.join(localDir, 'data.json');

  // Cache hit: Read from local storage
  if (fs.existsSync(localFile)) {
    const raw = fs.readFileSync(localFile, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Error parsing local JSON for slug ${slug}, falling back to fetch.`, e);
      // Fall through to fetch
    }
  }

  // Cache miss: Fetch from root Vercel API
  const rootApiUrl = process.env.ROOT_API_URL || 'https://api.restaurantsite.io';
  const internalSecret = process.env.INTERNAL_SYNC_SECRET;

  if (!internalSecret) {
    throw new Error('INTERNAL_SYNC_SECRET is not configured');
  }

  console.log(`Fetching data for ${slug} from ${rootApiUrl}...`);
  const response = await fetch(`${rootApiUrl}/api/internal/mcp-data?slug=${slug}`, {
    headers: {
      'Authorization': `Bearer ${internalSecret}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${slug}. Status: ${response.status}`);
  }

  const data = await response.json();

  // Save to local cache
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  fs.writeFileSync(localFile, JSON.stringify(data, null, 2), 'utf-8');

  return data;
};
