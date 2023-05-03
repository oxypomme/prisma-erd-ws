import fastify from '../lib/fastify.js';
import renderSchemaToERD from '../lib/prisma/renderSchemaToERD.js';
import renderSchemaToMermaid from '../lib/prisma/renderSchemaToMermaid.js';

/**
 * Gets if service is ok
 */
fastify.get('/', (req, res) => { res.send(); });

/**
 * Transform given prisma schema into a Mermaid
 */
fastify.post(
  '/mermaid/',
  {
    schema: {
      body: {
        type: 'string',
      },
    },
  },
  (req) => renderSchemaToMermaid(req.body),
);

/**
 * Transform given prisma schema into a ERD
 */
fastify.post(
  '/erd/',
  {
    schema: {
      body: {
        type: 'string',
      },
      querystring: {
        theme: {
          type: 'string',
        },
        format: {
          type: 'string',
          enum: ['svg', 'png', 'pdf'],
        },
      },
    },
  },
  async (req, res) => {
    const format = req.query.format ?? 'svg';
    const data = await renderSchemaToERD(req.body, format, req.query.theme);

    switch (format) {
      case 'svg':
        res.type('image/svg+xml');
        break;
      case 'png':
        res.type('image/png');
        break;
      case 'pdf':
        res.type('application/pdf');
        break;

      default:
        break;
    }

    return data;
  },
);
