// @ts-check
// eslint-disable-next-line import/no-unresolved
import { run as runMermaid } from '@mermaid-js/mermaid-cli';
import { v4 as uuid } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import renderSchemaToMermaid from './renderSchemaToMermaid.js';
import { TMP_FOLDER, processingIds } from '../crons/clearTempFiles.js';

/**
 * @typedef {"svg" | "png" | "pdf"} OutType
 * @typedef {`${string}.${OutType}`} OutFile
 */

/**
 * Render Prisma's schema into a ERD
 *
 * @param {string} schema Prisma's schema
 * @param {"svg" | "png" | "pdf"} outputFormat Output type of the ERD - Default: `svg`
 * @param {string} theme Theme used by Mermaid to generate ERD - Default: `default`
 *
 * @returns {Promise<string>} ERD into given output type
 */
export const renderERDfromSchema = async (schema, outputFormat = 'svg', theme = 'default') => {
  await fs.mkdir(TMP_FOLDER, { recursive: true });

  const id = uuid();
  const mmdFile = path.join(TMP_FOLDER, `${id}.mmd`);
  /**
   * @type {OutFile}
   */
  const outFile = /** * @type {OutFile} */ (path.join(TMP_FOLDER, `${id}.out`));

  processingIds.add(id);

  // Generate MMD and write it into a temp file
  const mmd = await renderSchemaToMermaid(schema);
  await fs.writeFile(mmdFile, mmd, 'utf-8');

  // Generate figure
  // TODO: theme doesn't work
  await runMermaid(mmdFile, outFile, { outputFormat, quiet: true });
  const generated = await fs.readFile(outFile, 'utf-8');

  // Cleaning up
  await fs.rm(mmdFile);
  await fs.rm(outFile);
  processingIds.delete(id);

  return generated;
};

export default renderERDfromSchema;
