import * as dotenv from 'dotenv';

dotenv.config();

// TODO: process.env.adminKey is deprecated

export default {
  crons: {
    clearTempFiles: process.env.CRONS_CLEAR_TMP_FILES || '0 0 * * *',
    cleanCache: process.env.CRONS_CLEAN_CACHE || '0 0 * * *',
  },
  tmpFolder: process.env.TMP_FOLDER || './tmp',
  dataFolder: process.env.DATA_FOLDER || './data',
  adminKey: process.env.ADMIN_KEY || process.env.adminKey || 'MDzFrquTtMvIkzCJ',
  cacheMaxTime: Number.parseInt(process.env.CACHE_MAX_TIME, 10) || (7 * 24 * 3600 * 1000),
};
