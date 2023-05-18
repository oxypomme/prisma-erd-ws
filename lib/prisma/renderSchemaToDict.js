// @ts-check
// extracted from https://github.com/Skn0tt/prisma-erd/

import prismaInternals from '@prisma/internals';

const { getDMMF } = prismaInternals;

/**
 * @typedef {import('@prisma/generator-helper').DMMF.Document} DMMFDocument
 */

/**
 * Generate formatted Markdown table
 *
 * @param {string[]} headers The table headers
 * @param {string[][]} rows Each item represent data to put for each column
 *
 * @returns {string} Markdown
 */
const generateMarkdownTable = (headers, rows) => {
  let parsedHeaders = '';
  let parsedRows = '';
  let separator = '';
  const widthMap = new Map();
  // Parse cols sizes
  for (let col = 0; col < headers.length; col += 1) {
    const header = headers[col];
    const colEls = rows.map((els) => els[col]);

    let maxWidth = header.length;
    // eslint-disable-next-line no-restricted-syntax
    for (const el of colEls) {
      if (el.length > maxWidth) {
        maxWidth = el.length;
      }
    }

    parsedHeaders += `| ${header.padEnd(maxWidth, ' ')} `;
    separator += `|-${''.padEnd(maxWidth, '-')}-`;
    widthMap.set(col, maxWidth);
  }
  separator += '|';
  parsedHeaders += '|';

  // eslint-disable-next-line no-restricted-syntax
  for (let row = 0; row < rows.length; row += 1) {
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < rows[row].length; i += 1) {
      const el = rows[row][i];
      parsedRows += `| ${el.padEnd(widthMap.get(i), ' ')} `;
    }
    parsedRows += '|\n';
  }

  return `${parsedHeaders}
${separator}
${parsedRows}`;
};

/**
 * Render DMMF's datamodel (Prisma) into Markdown as a data dictionary
 *
 * @param {string} name The name of the dictionary
 * @param {DMMFDocument} param1
 *
 * @returns {string} Markdown
 */
export const renderMDfromDMMF = (name, { datamodel }) => {
  // Enum parsing
  let enums = '';
  if (datamodel.enums.length > 0) {
    enums = datamodel.enums.map((e) => {
      let header = `### ${e.name}`;
      if (e.documentation) {
        header += `\n${e.documentation ?? ''}`;
      }

      return `${header}

${generateMarkdownTable(
    ['Value'],
    e.values.map((v) => [v.name]),
  )}`;
    }).join('\n');

    enums = `## Enums

${enums}`;
  }

  // Model parsing
  let models = '';
  if (datamodel.models.length > 0) {
    models = datamodel.models.map((m) => {
      let header = `### ${m.name}`;
      if (m.documentation) {
        header += `\n${m.documentation ?? ''}`;
      }

      const content = m.fields.map((f) => {
        const attributes = [];
        if (f.isId) {
          attributes.push('Id');
        }
        if (f.isGenerated) {
          attributes.push('Generated');
        }
        if (f.isReadOnly) {
          attributes.push('Readonly');
        }
        if (f.isUnique) {
          attributes.push('Unique');
        }

        return [
          f.name,
          `${f.type}${f.isList ? '[]' : ''}`,
          f.documentation ?? '', attributes.join(', ')];
      });

      return `${header}

${generateMarkdownTable(
    ['Property', 'Type', 'Description', 'Attributes'],
    content,
  )}`;
    }).join('\n');

    models = `## Models

${models}`;
  }

  return `# ${name}

${enums}
${models}`;
};

/**
 * Render Prisma's schema into Markdown as a data dictionary
 *
 * @param {string} name The name of the dictionary
 * @param {string} schema Prisma's schema
 *
 * @returns {Promise<string>} DML (Mermaid's schema)
 */
export const renderMDfromSchema = async (name, schema) => {
  const dmmf = await getDMMF({ datamodel: schema });
  return renderMDfromDMMF(name, dmmf);
};
