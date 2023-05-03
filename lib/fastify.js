import FastifyFactory from 'fastify';

const fastify = FastifyFactory({ logger: true });

/**
 * Starts the fastify server
 */
export const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

export default fastify;
