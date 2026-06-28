import { Request } from 'express';

export interface McpRequest extends Request {
  slug?: string;
  restaurantId?: string;  // UUID from Supabase — used by calendar tool calls
  storeId?: string;
}

export interface RestaurantData {
  uid: string;
  name: string;
  // Fallback to allow any properties to be read
  [key: string]: any;
}
