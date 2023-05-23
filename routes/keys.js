// @ts-check
import fastify from '../lib/fastify.js';
import { addKey, removeKey } from '../lib/keys.js';
import { requireAdmin } from '../middlewares/auth.js';

/**
 * @typedef {{ key: string }} KeyParams
 */

/**
 * Add a new key
 */
fastify.put(
  '/keys/:key',
  {
    schema: {
      params: {
        key: {
          type: 'string',
        },
      },
    },
    preHandler: requireAdmin,
  },
  async (req, res) => {
    /**
     * @type {KeyParams}
     */
    // eslint-disable-next-line prefer-destructuring
    const params = /** @type {KeyParams} */ (req.params);

    const created = await addKey(params.key);
    if (created) {
      res.status(201);
    }
    return { created };
  },
);

/**
 * Delete key
 */
fastify.delete(
  '/keys/:key',
  {
    schema: {
      params: {
        key: {
          type: 'string',
        },
      },
    },
    preHandler: requireAdmin,
  },
  async (req) => {
    /**
     * @type {KeyParams}
     */
    // eslint-disable-next-line prefer-destructuring
    const params = /** @type {KeyParams} */ (req.params);

    const deleted = await removeKey(params.key);
    return { deleted };
  },
);
