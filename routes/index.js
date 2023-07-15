// @ts-check
import sanitizeHtml from 'sanitize-html';

import fastify from '../lib/fastify.js';
import { renderMDfromSchema } from '../lib/prisma/renderSchemaToDict.js';
import renderSchemaToERD from '../lib/prisma/renderSchemaToERD.js';
import renderSchemaToMermaid from '../lib/prisma/renderSchemaToMermaid.js';
import mdConverter from '../lib/showdown.js';
import '../lib/keys.js';

import { requireKey } from '../middlewares/auth.js';

import './keys.js';

/**
 * @typedef {{ format?: 'svg' | 'png' | 'pdf', theme?: string }} QueryERDParams
 * @typedef {{ format?: 'html' | 'md', name: string }} QueryDictParams
 */

/**
 * Gets if service is ok
 */
fastify.get('/', (req, res) => { res.code(204); res.send(); });

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
    preHandler: requireKey,
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
    preHandler: requireKey,
  },
  async (req, res) => {
    /**
     * @type {QueryERDParams}
     */
    // eslint-disable-next-line prefer-destructuring
    const query = /** * @type {QueryERDParams} */(req.query);
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

/**
 * Transform given prisma schema into a data dict
 */
fastify.post(
  '/dict/',
  {
    schema: {
      body: {
        type: 'string',
      },
      querystring: {
        name: {
          type: 'string',
        },
        format: {
          type: 'string',
          enum: ['md', 'html'],
        },
      },
    },
    preHandler: requireKey,
  },
  async (req, res) => {
    /**
     * @type {QueryDictParams}
     */
    // eslint-disable-next-line prefer-destructuring
    const query = /** * @type {QueryDictParams} */(req.query);
    /**
     * @type {string}
     */
    // eslint-disable-next-line prefer-destructuring
    const body = /** * @type {string} */ (req.body);

    if (!query.name) {
      throw new Error('A name must be provided');
    }

    const format = query.format || 'md';
    const md = await renderMDfromSchema(query.name, body);

    res.type('text/markdown');
    let mdOrHTML = md;
    if (format === 'html') {
      res.type('text/html');
      mdOrHTML = mdConverter.makeHtml(md);
    }

    return sanitizeHtml(mdOrHTML);
  },
);
