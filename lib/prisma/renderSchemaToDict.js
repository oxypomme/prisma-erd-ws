// @ts-check
// extracted from https://github.com/Skn0tt/prisma-erd/

import prismaInternals from '@prisma/internals';

const { getDMMF } = prismaInternals;

/**
 * @typedef {import('@prisma/generator-helper').DMMF.Document} DMMFDocument
 */

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

      const content = e.values.map((v) => `| ${v.name} |`).join('\n');

      return `${header}

| Value |
|-------|
${content}`;
    }).join('\n\n');

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

        return `| ${f.name} | ${f.type}${f.isList ? '[]' : ''} | ${f.documentation ?? ''} | ${attributes.join(', ')} |`;
      }).join('\n');

      return `${header}

| Property | Type | Description | Attributes |
|----------|------|-------------|------------|
${content}`;
    }).join('\n\n');

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
