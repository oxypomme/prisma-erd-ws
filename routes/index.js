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
import { getCacheFromSchema, putCacheFromSchema } from '../lib/cache.js';

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
  async (req) => {
    /**
     * @type {string}
     */
    // eslint-disable-next-line prefer-destructuring
    const body = /** * @type {string} */ (req.body);

    const cache = getCacheFromSchema(body, 'mermaid');
    if (cache) {
      return cache;
    }

    const mermaid = renderSchemaToMermaid(body);
    return putCacheFromSchema(body, 'mermaid', await mermaid);
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

    const cache = getCacheFromSchema(body, 'erd') ?? {};
    if (cache[format]) {
      return cache[format];
    }

    const data = await renderSchemaToERD(body, format, query.theme);
    cache[format] = data;
    putCacheFromSchema(body, 'erd', cache);

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

    const cache = getCacheFromSchema(body, 'dict') ?? {};
    if (cache[format]) {
      return cache[format];
    }

    let md = cache.md || '';
    if (!md) {
      md = await renderMDfromSchema(query.name, body);
      cache.md = sanitizeHtml(md);
    }

    switch (format) {
      case 'md':
        res.type('text/markdown');
        break;

      case 'html':
        res.type('text/html');
        cache.html = sanitizeHtml(mdConverter.makeHtml(md));
        break;

      default:
        break;
    }

    putCacheFromSchema(body, 'dict', cache);
    return cache[format];
  },
);
