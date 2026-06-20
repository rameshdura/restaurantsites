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

  const slug = req.query.slug as string;
  if (!slug) {
    res.status(400).json({ error: 'Bad Request: slug query parameter is required' });
    return;
  }

  // Prevent directory traversal attacks
  if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
    res.status(400).json({ error: 'Bad Request: Invalid slug format' });
    return;
  }

  req.slug = slug;
  next();
};
