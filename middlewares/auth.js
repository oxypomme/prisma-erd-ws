// @ts-check

import config from '../lib/config.js';
import { isValidKey } from '../lib/keys.js';

/**
 * @typedef {import('fastify').FastifyRequest} Request
 * @typedef {import('fastify').preHandlerHookHandler} PreRequestHandler
 */

/**
 * @param {Request} req The fastify request
 *
 * @returns {string} The api key provided
 *
 * @throws If no api key was provided or was wrong
 */
const getApiKey = (req) => {
  const apiKey = req.headers['x-api-key']?.toString();

  if (!apiKey) {
    throw new Error('No API Key provided');
  }

  if (!isValidKey(apiKey)) {
    throw new Error('API Key provided is not registered');
  }

  return apiKey;
};

/**
 * Check if api key is provided and valid
 *
 * @type {PreRequestHandler}
 */
export const requireKey = (req, res, done) => {
  getApiKey(req);
  done();
};

/**
 * Check if api key is provided, valid, and is the admin one
 *
 * @type {PreRequestHandler}
 */
export const requireAdmin = (req, res, done) => {
  const apiKey = getApiKey(req);
  if (apiKey !== config.adminKey) {
    throw new Error('API Key provided is not the admin one');
  }
  done();
};
