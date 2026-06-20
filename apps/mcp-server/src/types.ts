import { Request } from 'express';

export interface McpRequest extends Request {
  slug?: string;
}

export interface RestaurantData {
  uid: string;
  name: string;
  // Fallback to allow any properties to be read
  [key: string]: any;
}
