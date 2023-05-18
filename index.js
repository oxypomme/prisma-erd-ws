// @ts-check
import './lib/crons/index.js';
import { start } from './lib/fastify.js';
import './routes/index.js';

start();
