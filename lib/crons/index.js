// @ts-check
import { CronJob } from 'cron';
import clearTempFiles from './clearTempFiles.js';
import cleanCache from './cleanCache.js';
import config from '../config.js';

// Clear dangling temp files
(new CronJob(
  config.crons.clearTempFiles,
  clearTempFiles,
  null,
  false,
)).start();

// Clean unused cache
(new CronJob(
  config.crons.cleanCache,
  cleanCache,
  null,
  false,
)).start();
