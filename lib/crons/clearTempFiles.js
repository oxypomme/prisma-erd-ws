// @ts-check
import fs from 'fs/promises';
import path from 'path';

import fastify from '../fastify.js';
import config from '../config.js';

/**
 * Which ids are currently processed (and so we don't want to delete them)
 */
export const processingIds = new Set();

export default async () => {
  try {
    const files = await fs.readdir(config.tmpFolder);
    fastify.log.debug(`Found ${files.length} files`);
    if (files.length <= 0) {
      return;
    }

    const promises = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const id = /^[^.]*/.exec(file);
      if (!processingIds.has(id)) {
        promises.push(
          fs
            .rm(path.join(config.tmpFolder, file))
            .then(() => fastify.log.debug(`Deleted dangling "${id}"`)),
        );
      }
    }

    const results = await Promise.allSettled(promises);
    fastify.log.info(
      `Deleted ${results.reduce((p, v) => {
        const r = v.status === 'fulfilled' ? p + 1 : p;
        return r;
      }, 0)} files`,
    );
  } catch (error) {
    fastify.log.error(error);
  }
};
