import * as dotenv from 'dotenv';

dotenv.config();

export default {
  crons: {
    clearTempFiles: process.env.CRONS_CLEAR_TMP_FILES || '0 0 * * *',
  },
  tmpFolder: process.env.TMP_FOLDER || './tmp',
  dataFolder: process.env.DATA_FOLDER || './data',
  adminKey: process.env.adminKey || 'MDzFrquTtMvIkzCJ',
};
