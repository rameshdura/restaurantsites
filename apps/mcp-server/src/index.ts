import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { setupMcpServer } from './mcp';
import { authMiddleware } from './auth';
import { McpRequest } from './types';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());

// Store transports for active sessions
// Map<sessionId, SSEServerTransport>
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', authMiddleware, async (req: McpRequest, res) => {
  const slug = req.slug!;
  
  console.log(`New SSE connection initiated for slug: ${slug}`);

  // Create SSE transport
  const transport = new SSEServerTransport('/message', res);

  // Create an MCP Server instance scoped to this slug
  const mcpServer = setupMcpServer(slug);
  await mcpServer.connect(transport);

  // Save transport mapping
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);

  res.on('close', () => {
    console.log(`SSE connection closed for session: ${sessionId}`);
    transports.delete(sessionId);
  });
});

app.post('/message', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).json({ error: 'sessionId query parameter is required' });
    return;
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  await transport.handlePostMessage(req, res);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('RestaurantSite MCP Server is running.');
});

app.listen(port, () => {
  console.log(`MCP Server listening on port ${port}`);
});

// reload trigger

