// @ts-check
import { CronJob } from 'cron';
import clearTempFiles from './clearTempFiles.js';

// Clear dangling temp files
(new CronJob(
  process.env.NODE_ENV === 'production' ? '0 0 * * *' : '* * * * *',
  clearTempFiles,
  null,
  false,
)).start();
