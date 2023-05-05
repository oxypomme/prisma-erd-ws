// @ts-check
import { start } from './lib/fastify.js';
import './routes/index.js';
import './lib/crons/index.js';

start();
