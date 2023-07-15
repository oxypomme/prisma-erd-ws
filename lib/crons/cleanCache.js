// @ts-check
import { deleteCacheFromKey, getCacheKeys, getUpdatedFromKey } from '../cache.js';
import fastify from '../fastify.js';
import config from '../config.js';

export default () => {
  const keys = getCacheKeys() ?? [];
  const limit = new Date().getTime() - config.cacheMaxTime;

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      const updated = getUpdatedFromKey(key);
      if (updated?.getTime() <= limit) {
        deleteCacheFromKey(key);
      }
    }
  } catch (error) {
    fastify.log.error(error);
  }
};
