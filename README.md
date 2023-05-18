# prisma-erd-ws
WebService to generate ERD from Prisma schema

Based on https://github.com/Skn0tt/prisma-erd/

## GET /

Check if service is OK

## POST /mermaid/

Generate [Mermaid.JS](https://mermaid.js.org/) model based on a Prisma schema

#### Body

The prisma schema

### POST /erd/

Generate ERD based on a Prisma schema

#### Body

The Prisma schema

#### Query parameters

- `format`: `'svg' | 'png' | 'pdf'`. In which format the ERD will be generated

### POST /dict/

Generate data dictionary based on a Prisma schema

#### Body

The Prisma schema

#### Query parameters

- `name`: `string`. Name of the dict. **Mandatory**
- `format`: `'html' | 'md'`. In which format the dict will be generated
