// @ts-check
import fs from "fs/promises";
import path from "path";
import fastify from "../fastify.js";

/**
 * Where temporary fils are stored
 */
export const TMP_FOLDER = "./tmp";
/**
 * Which ids are currently processed (and so we don't want to delete them)
 */
export const processingIds = new Set();

export default async () => {
  try {
    const files = await fs.readdir(TMP_FOLDER);
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
            .rm(path.join(TMP_FOLDER, file))
            .then(() => fastify.log.debug(`Deleted dangling "${id}"`))
        );
      }
    }

    const results = await Promise.allSettled(promises);
    fastify.log.info(
      `Deleted ${results.reduce((p, v) => {
        const r = v.status === "fulfilled" ? p + 1 : p;
        return r;
      }, 0)} files`
    );
  } catch (error) {
    fastify.log.error(error);
  }
};
