import { Response, NextFunction } from 'express';
import { McpRequest } from './types';

export const authMiddleware = (req: McpRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const apiKeyQuery = req.query.apiKey as string;
  const expectedKey = process.env.MCP_API_KEY;

  if (!expectedKey) {
    console.error('MCP_API_KEY is not set in the environment variables.');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const isAuthorized = authHeader === `Bearer ${expectedKey}` || apiKeyQuery === expectedKey;

  if (!isAuthorized) {
    res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    return;
  }

  // Accept either ?slug= or ?restaurant_id= (UUID for calendar tool calls)
  const slug = req.query.slug as string | undefined;
  const restaurantId = req.query.restaurant_id as string | undefined;

  if (!slug && !restaurantId) {
    res.status(400).json({ error: 'Bad Request: slug or restaurant_id query parameter is required' });
    return;
  }

  // Validate slug format to prevent directory traversal
  if (slug && !/^[a-zA-Z0-9-_]+$/.test(slug)) {
    res.status(400).json({ error: 'Bad Request: Invalid slug format' });
    return;
  }

  // Validate restaurant_id is a valid UUID
  if (restaurantId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(restaurantId)) {
    res.status(400).json({ error: 'Bad Request: Invalid restaurant_id format (expected UUID)' });
    return;
  }

  req.slug = slug ?? '';
  req.restaurantId = restaurantId;
  next();
};

