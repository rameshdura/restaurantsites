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

        // Validate date format YYYY-MM-DD
        const dateMatch = args.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!dateMatch || !dateMatch[3]) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ available: false, message: 'Invalid date format. Use YYYY-MM-DD.' }, null, 2) }]
          };
        }

        const day = parseInt(dateMatch[3], 10);
        const acceptsReservations = data.reservation?.acceptsReservations !== false;
        const maxPartySize = data.reservation?.maximumPartySize || 20;
        const minPartySize = data.reservation?.minimumPartySize || 1;

        if (!acceptsReservations) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ available: false, message: 'This restaurant does not accept reservations.' }, null, 2) }]
          };
        }

        if (args.partySize < minPartySize || args.partySize > maxPartySize) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ available: false, message: `Party size must be between ${minPartySize} and ${maxPartySize}.` }, null, 2) }]
          };
        }

        // Even date requirement: true if day is even, false otherwise
        const isEven = day % 2 === 0;
        if (isEven) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ available: true, message: `Date ${args.date} is available for reservation.` }, null, 2) }]
          };
        } else {
          return {
            content: [{ type: 'text', text: JSON.stringify({ available: false, message: `No availability on odd date ${args.date}.` }, null, 2) }]
          };
        }
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

        // First check availability
        const dateMatch = args.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!dateMatch || !dateMatch[3]) {
          throw new Error('Invalid date format. Use YYYY-MM-DD.');
        }

        const day = parseInt(dateMatch[3], 10);
        const acceptsReservations = data.reservation?.acceptsReservations !== false;
        const maxPartySize = data.reservation?.maximumPartySize || 20;
        const minPartySize = data.reservation?.minimumPartySize || 1;

        if (!acceptsReservations) {
          throw new Error('This restaurant does not accept reservations.');
        }

        if (args.partySize < minPartySize || args.partySize > maxPartySize) {
          throw new Error(`Party size must be between ${minPartySize} and ${maxPartySize}.`);
        }

        if (day % 2 !== 0) {
          throw new Error(`No availability on odd date ${args.date}.`);
        }

        // Save demo booking
        const bookingsDir = path.join(DATA_DIR, slug);
        if (!fs.existsSync(bookingsDir)) {
          fs.mkdirSync(bookingsDir, { recursive: true });
        }
        const bookingsFile = path.join(bookingsDir, 'bookings.json');

        let bookings: any[] = [];
        if (fs.existsSync(bookingsFile)) {
          try {
            bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf-8'));
          } catch (e) {
            bookings = [];
          }
        }

        const newBooking = {
          id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          restaurantSlug: slug,
          ...args,
          createdAt: new Date().toISOString(),
          status: 'confirmed'
        };

        bookings.push(newBooking);
        fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2), 'utf-8');

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Demo booking created successfully.', booking: newBooking }, null, 2) }]
        };
      }

      if (request.params.name === 'list_demo_bookings') {
        const bookingsFile = path.join(DATA_DIR, slug, 'bookings.json');
        let bookings: any[] = [];
        if (fs.existsSync(bookingsFile)) {
          try {
            bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf-8'));
          } catch (e) {
            bookings = [];
          }
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ bookings }, null, 2) }]
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
