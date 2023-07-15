// @ts-check
import { CronJob } from 'cron';

import config from '../config.js';
import fastify from '../fastify.js';

import clearTempFiles from './clearTempFiles.js';
import cleanCache from './cleanCache.js';

const crons = {
  clearTempFiles,
  cleanCache,
};

// eslint-disable-next-line no-restricted-syntax
for (const [name, fnc] of Object.entries(crons)) {
  (new CronJob(
    config.crons[name],
    fnc,
    null,
    false,
  )).start();

  fastify.log.info(`Cron [${name}] registered with [${config.crons[name]}]`);
}
