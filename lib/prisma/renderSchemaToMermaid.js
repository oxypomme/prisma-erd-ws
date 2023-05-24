// @ts-check
// extracted from https://github.com/Skn0tt/prisma-erd/

import prismaInternals from '@prisma/internals';

const { getDMMF } = prismaInternals;

/**
 * @typedef {import('@prisma/generator-helper').DMMF.Document} DMMFDocument
 */

/**
 * Render DMMF's datamodel (Prisma) into DML (Mermaid)
 *
 * @param {DMMFDocument} param0
 *
 * @returns {string} DML (Mermaid)
 */
export const renderDMLfromDMMF = ({ datamodel }) => {
  // TODO: enums
  const diagram = 'erDiagram';

  const classes = datamodel.models
    .map(
      (model) => {
        let primaryKey = model.primaryKey ? new Set(model.primaryKey.fields) : undefined;
        if (!primaryKey) {
          const idField = model.fields.find((f) => f.isId);
          if (idField) {
            primaryKey = new Set([idField.name]);
          }
        }

        return `  ${model.name} {
${model.fields
    .filter(
      (field) => field.kind !== 'object',
    )
    .map((field) => {
      const attributes = [];
      if (primaryKey?.has(field.name)) {
        attributes.push('PK');
      }

      if (field.isUnique) {
        attributes.push('UK');
      }

      if (model.fields.some(({ relationFromFields }) => relationFromFields?.includes(field.name))) {
        attributes.push('FK');
      }

      return `    ${field.type}${field.isList ? '[]' : ''} ${field.name} ${attributes.join(',')}`;
    })
    .join('\n')}
  }
`;
      },
    )
    .join('\n\n');

  let relationShips = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const model of datamodel.models) {
    // eslint-disable-next-line no-restricted-syntax
    for (const field of model.fields) {
      if (field.relationFromFields && field.relationFromFields.length > 0) {
        const relationshipName = field.name;
        const thisSide = model.name;
        const otherSide = field.type;

        let thisSideMultiplicity = '||';
        if (field.isList) {
          thisSideMultiplicity = '}o';
        } else if (!field.isRequired) {
          thisSideMultiplicity = '|o';
        }
        const otherModel = datamodel.models.find((m) => m.name === otherSide);
        const otherField = otherModel?.fields.find(
          ({ relationName }) => relationName === field.relationName,
        );

        const otherSideMultiplicity = '||';
        if (otherField?.isList) {
          thisSideMultiplicity = 'o{';
        } else if (otherField?.isRequired) {
          thisSideMultiplicity = 'o|';
        }

        relationShips += `    ${thisSide} ${thisSideMultiplicity}--${otherSideMultiplicity} ${otherSide} : "${relationshipName}"\n`;
      }
    }
  }

  return `${diagram}\n${classes}\n${relationShips}`;
};

/**
 * Render Prisma's schema into a Mermaid's schema
 *
 * @param {string} schema Prisma's schema
 *
 * @returns {Promise<string>} DML (Mermaid's schema)
 */
export const renderDMLfromSchema = async (schema) => {
  const dmmf = await getDMMF({ datamodel: schema });
  return renderDMLfromDMMF(dmmf);
};

export default renderDMLfromSchema;
