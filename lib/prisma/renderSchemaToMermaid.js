// extracted from https://github.com/Skn0tt/prisma-erd/

import prismaInternals from '@prisma/internals';

const { getDMMF } = prismaInternals;

export const renderDml = (dml) => {
  const diagram = 'erDiagram';

  const classes = dml.models
    .map(
      (model) => `  ${model.name} {
${model.fields
    .filter(
      (field) => field.kind !== 'object'
      && !model.fields.find(
        ({ relationFromFields }) => relationFromFields && relationFromFields.includes(field.name),
      ),
    )
    .map((field) => `    ${field.type} ${field.name}`)
    .join('\n')}  
  }
`,
    )
    .join('\n\n');

  let relationShips = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const model of dml.models) {
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
        const otherModel = dml.models.find((m) => m.name === otherSide);
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

export default async (datamodel) => {
  const dmmf = await getDMMF({ datamodel });
  return renderDml(dmmf.datamodel);
};
