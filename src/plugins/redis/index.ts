import fp from 'fastify-plugin';
import fastifyRedis from "fastify-redis";

const redisPlugin = (async (server, opts, next) => {

    // config
    const config = {
        host: server.conf.redistHost,
        port: server.conf.redisPort,
        closeClient: true
    };

    // redis
    server.register(fastifyRedis, config);
});
export default fp(redisPlugin);