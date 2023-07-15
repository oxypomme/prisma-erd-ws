// @ts-check
import hash from 'object-hash';

/**
 * @typedef { 'dict' | 'mermaid' | 'erd' } CacheType
 * @typedef { Record<CacheType, any | undefined> } CacheItem
 */

/**
 * @type { Record<string, CacheItem & { updatedAt: Date }> }
 */
const cache = {};

/**
 * @param {string} schema The Prisma schema
 * @returns The key used to get/set cache
 */
const genKey = (schema) => hash(schema);

/**
 * Put data generated from schema in cache
 *
 * @param {string} schema
 * @param {CacheType} type
 * @param {any} data
 *
 * @returns the item from cache
 */
export const putCacheFromSchema = (schema, type, data) => {
  const key = genKey(schema);
  const obj = cache[key] || {};
  obj[type] = data;
  obj.updatedAt = new Date();
  cache[key] = obj;
  return obj[type];
};

/**
 * Get from schema from cache
 *
 * @param {string} key
 * @param {CacheType} type
 *
 * @returns the item from cache
 */
export const getCacheFromKey = (key, type) => {
  if (!cache[key]) {
    return undefined;
  }

  cache[key].updatedAt = new Date();
  return cache[key][type];
};

/**
 * Get data generated from schema from cache
 *
 * @param {string} schema
 * @param {CacheType} type
 *
 * @returns the item from cache
 */
export const getCacheFromSchema = (schema, type) => {
  const key = genKey(schema);
  return getCacheFromKey(key, type);
};

/**
 * Get last updated date from cache
 *
 * @param {string} key
 *
 * @returns the item from cache
 */
export const getUpdatedFromKey = (key) => cache[key].updatedAt;

/**
 * Delete from schema from cache
 *
 * @param {string} key
 *
 * @returns the item from cache
 */
export const deleteCacheFromKey = (key) => {
  const item = cache[key];
  delete cache[key];
  return item;
};

/**
 * Delete data generated from schema in cache
 *
 * @param {string} schema
 *
 * @returns the item deleted from cache
 */
export const deleteCacheFromSchema = (schema) => {
  const key = genKey(schema);
  return deleteCacheFromKey(key);
};

/**
 * @returns The keys stored in cache
 */
export const getCacheKeys = () => Object.keys(cache);
