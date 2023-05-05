// @ts-check
import fastify from '../lib/fastify.js';
import renderSchemaToERD from '../lib/prisma/renderSchemaToERD.js';
import renderSchemaToMermaid from '../lib/prisma/renderSchemaToMermaid.js';

/**
 * @typedef {{ format?: 'svg' | 'png' | 'pdf', theme?: string }} QueryParams
 */

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
  (req) => {
    /**
     * @type {string}
     */
    // eslint-disable-next-line prefer-destructuring
    const body = /** * @type {string} */ (req.body);

    return renderSchemaToMermaid(body);
  },
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
    /**
     * @type {QueryParams}
     */
    // eslint-disable-next-line prefer-destructuring
    const query = /** * @type {QueryParams} */(req.query);
    /**
     * @type {string}
     */
    // eslint-disable-next-line prefer-destructuring
    const body = /** * @type {string} */(req.body);

    const format = query.format ?? 'svg';
    const data = await renderSchemaToERD(body, format, query.theme);

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
