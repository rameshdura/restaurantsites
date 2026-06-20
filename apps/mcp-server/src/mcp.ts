import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getRestaurantData } from './fetcher';

export const setupMcpServer = (slug: string) => {
  const server = new Server(
    {
      name: `restaurant-mcp-${slug}`,
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Expose Resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'restaurant://data.json',
        name: `${slug} Data JSON`,
        description: 'The complete structured JSON data for the restaurant, including menu, settings, and SEO.',
        mimeType: 'application/json',
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'restaurant://data.json') {
      try {
        const data = await getRestaurantData(slug);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Resource read error: ${error.message}`);
      }
    }
    throw new Error(`Resource not found: ${request.params.uri}`);
  });

  // Expose Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'get_restaurant_info',
        description: 'Get basic top-level information about the restaurant.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_menu',
        description: 'Get the full structured menu of the restaurant.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_pages_config',
        description: 'Get the page configurations and sections layout for the restaurant.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      }
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const data = await getRestaurantData(slug);

      if (request.params.name === 'get_restaurant_info') {
        const info = {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          description: data.description,
          contact: data.contact,
          openingHours: data.openingHours
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
        };
      }

      if (request.params.name === 'get_menu') {
        const menu = {
          menuCategories: data.menuCategories,
          menu: data.menu
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(menu, null, 2) }],
        };
      }
      
      if (request.params.name === 'get_pages_config') {
        return {
          content: [{ type: 'text', text: JSON.stringify(data.pages || {}, null, 2) }],
        };
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Tool error: ${error.message}` }],
      };
    }
  });

  return server;
};
