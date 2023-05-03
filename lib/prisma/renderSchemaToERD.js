import { run as runMermaid } from '@mermaid-js/mermaid-cli';
import { v4 as uuid } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import renderSchemaToMermaid from './renderSchemaToMermaid.js';
import { TMP_FOLDER, proccessingIds } from '../crons/clearTempFiles.js';

// eslint-disable-next-line import/prefer-default-export
export default async (schema, outputFormat = 'svg', theme = 'default') => {
  await fs.mkdir(TMP_FOLDER, { recursive: true });

  const id = uuid();
  const mmdFile = path.join(TMP_FOLDER, `${id}.mmd`);
  const outFile = path.join(TMP_FOLDER, `${id}.out`);

  proccessingIds.add(id);

  // Generate MMD and write it into a temp file
  const mmd = await renderSchemaToMermaid(schema);
  await fs.writeFile(mmdFile, mmd, 'utf-8');

  // Generate figure
  // TODO: file type, theme, etc.
  await runMermaid(mmdFile, outFile, { outputFormat, quiet: true, theme });
  const generated = await fs.readFile(outFile, 'utf-8');

  // Cleaning up
  await fs.rm(mmdFile);
  await fs.rm(outFile);
  proccessingIds.delete(id);

  return generated;
};
