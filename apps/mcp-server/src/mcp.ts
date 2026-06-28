import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getRestaurantData } from './fetcher';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

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
      },
      {
        name: 'get_booking_settings',
        description: 'Get the restaurant reservation and booking settings.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'check_booking_availability',
        description: 'Check availability for a reservation on a specific date, time, and party size.',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date in YYYY-MM-DD format (e.g. 2026-06-28)'
            },
            time: {
              type: 'string',
              description: 'Time in HH:MM format (e.g. 19:00)'
            },
            partySize: {
              type: 'number',
              description: 'Number of guests'
            }
          },
          required: ['date', 'time', 'partySize']
        },
      },
      {
        name: 'create_demo_booking',
        description: 'Create a demo booking/reservation for testing.',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date in YYYY-MM-DD format'
            },
            time: {
              type: 'string',
              description: 'Time in HH:MM format'
            },
            partySize: {
              type: 'number',
              description: 'Number of guests'
            },
            customerName: {
              type: 'string',
              description: 'Name of the customer'
            },
            customerEmail: {
              type: 'string',
              description: 'Email of the customer'
            },
            customerPhone: {
              type: 'string',
              description: 'Phone number of the customer'
            }
          },
          required: ['date', 'time', 'partySize', 'customerName', 'customerEmail', 'customerPhone']
        },
      },
      {
        name: 'list_demo_bookings',
        description: 'List all mock/demo bookings made for this restaurant.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'cancel_booking',
        description: 'Cancel a booking by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The booking ID'
            }
          },
          required: ['id']
        },
      },
      {
        name: 'get_booking',
        description: 'Get details of a booking by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The booking ID'
            }
          },
          required: ['id']
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

      const getApiUrl = (path: string) => {
        const root = process.env.ROOT_API_URL || 'http://localhost:3000';
        return `${root.replace(/\/$/, '')}${path}`;
      };

      if (request.params.name === 'get_booking_settings') {
        const settings = {
          reservation: data.reservation || {
            acceptsReservations: true,
            reservationMethods: ["phone", "online"],
            minimumPartySize: 1,
            maximumPartySize: 20
          },
          openingHours: data.openingHours || [],
          holidayNotes: data.holidayNotes || ""
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(settings, null, 2) }],
        };
      }

      if (request.params.name === 'check_booking_availability') {
        const args = request.params.arguments as { date: string; time: string; partySize: number } | undefined;
        if (!args || !args.date || !args.time || !args.partySize) {
          throw new Error('Missing required arguments: date, time, partySize');
        }

        const url = getApiUrl(`/api/bookings?restaurantSlug=${slug}&checkAvailability=true&date=${args.date}&time=${args.time}&partySize=${args.partySize}`);
        const res = await fetch(url);
        const json = await res.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(json, null, 2) }]
        };
      }

      if (request.params.name === 'create_demo_booking') {
        const args = request.params.arguments as {
          date: string;
          time: string;
          partySize: number;
          customerName: string;
          customerEmail: string;
          customerPhone: string;
        } | undefined;

        if (!args || !args.date || !args.time || !args.partySize || !args.customerName || !args.customerEmail || !args.customerPhone) {
          throw new Error('Missing required arguments for booking creation.');
        }

        const url = getApiUrl('/api/bookings');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantSlug: slug, ...args })
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            isError: true,
            content: [{ type: 'text', text: json.error || 'Failed to create booking.' }]
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(json, null, 2) }]
        };
      }

      if (request.params.name === 'list_demo_bookings') {
        const url = getApiUrl(`/api/bookings?restaurantSlug=${slug}`);
        const res = await fetch(url);
        const json = await res.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(json, null, 2) }]
        };
      }

      if (request.params.name === 'cancel_booking') {
        const args = request.params.arguments as { id: string } | undefined;
        if (!args || !args.id) {
          throw new Error('Missing required argument: id');
        }

        const url = getApiUrl(`/api/bookings/${args.id}`);
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        });
        const json = await res.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(json, null, 2) }]
        };
      }

      if (request.params.name === 'get_booking') {
        const args = request.params.arguments as { id: string } | undefined;
        if (!args || !args.id) {
          throw new Error('Missing required argument: id');
        }

        const url = getApiUrl(`/api/bookings/${args.id}`);
        const res = await fetch(url);
        const json = await res.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(json, null, 2) }]
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
