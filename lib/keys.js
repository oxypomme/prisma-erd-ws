// @ts-check
import path from 'node:path';
import fs from 'node:fs/promises';
import config from './config.js';
import fastify from './fastify.js';

const keystorePath = path.resolve(config.dataFolder, 'keys.json');

// File init
await fs.mkdir(config.dataFolder, { recursive: true });

try {
  await fs.access(keystorePath);
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
  fastify.log.info(`Created ketstore at [${keystorePath}]`);
  await fs.writeFile(keystorePath, '[]');
}
const keys = new Set(JSON.parse((await fs.readFile(keystorePath, 'utf-8')) || '[]'));

// methods
const syncKeystore = async () => fs.writeFile(keystorePath, JSON.stringify([...keys.values()]), 'utf-8');

/**
 * Check if key is valid and already registered
 *
 * @param {string} key
 *
 * @returns {boolean}
 */
export const isValidKey = (key) => keys.has(key);

/**
 * Register a key
 *
 * @param {string} key
 * @returns {Promise<boolean>} `true` if key was added, `false` if already exist
 */
export const addKey = async (key) => {
  const isAdded = !isValidKey(key);
  keys.add(key);
  await syncKeystore();
  fastify.log.info(`Added key [${key}] into keystore`);
  return isAdded;
};

/**
 * Unregister a key
 *
 * @param {string} key
 *
 * @returns {Promise<boolean>} `true` if key was deleted, `false` if not found
 */
export const removeKey = async (key) => {
  const isDeleted = keys.delete(key);
  await syncKeystore();
  fastify.log.info(`Delete key [${key}] from keystore`);
  return isDeleted;
};

// Keys init
if (!isValidKey(config.adminKey)) {
  await addKey(config.adminKey);
}
