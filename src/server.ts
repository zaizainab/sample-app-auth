import { fastify } from 'fastify';
import fastifyBlipp from "fastify-blipp";
import fastifySwagger from "fastify-swagger";
import fastifyJwt from "fastify-jwt";
import AutoLoad from "fastify-autoload";

import apmServer from 'elastic-apm-node';
import * as path from "path";
import * as dotenv from 'dotenv';

import redisPlugin from './plugins/redis/index';

dotenv.config({
    path: path.resolve('.env'),
});

// configuration
const port: any = process.env.PORT;
const secretKey: string = process.env.SECRET;
const expireToken = process.env.EXPIRE_TOKEN;

const redisPort: any = process.env.REDIS_PORT;
const redistHost: string = process.env.REDIS_HOST;

const apmUrl: string = process.env.APM_URL;

var apm = apmServer.start({
    // Override service name from package.json
    serviceName: 'apm-server',

    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: apmUrl,
});

export const createServer = () => new Promise((resolve, reject) => {

    const server = fastify({
        ignoreTrailingSlash: true,
        logger: {
            prettyPrint: true,
            level: "info",

        },
        bodyLimit: 15000 * 1024,
        pluginTimeout: 12000
    });

    //-----------------------------------------------------
    // register plugin below:
    server.register(fastifyBlipp);

    // swagger / open api
    server.register(fastifySwagger, {
        routePrefix: '/swagger',
        swagger: {
            info: {
                title: 'Auth API Documentation',
                description: 'Auth API Documentation',
                version: '0.1.0'
            },
            schemes: ['http', 'https'],
            consumes: ['application/json'],
            produces: ['application/json'],
        },
        hideUntagged: true,
        exposeRoute: true
    });

    // jwt
    server.register(fastifyJwt, { secret: secretKey });

    // auto register all routes 
    server.register(AutoLoad, {
        dir: path.join(__dirname, 'modules/routes')
    });


    // plugins
    server.register(redisPlugin);

    server.get('/', async (request, reply) => {
        return {
            hello: 'world'
        };
    });

    //apm 
    server.decorate('apm', apmServer);

    //-----------------------------------------------------
    // decorators
    server.decorate('conf', { port, secretKey, expireToken, redisPort, redistHost, apmUrl });

    //-----------------------------------------------------
    server.addHook('onRequest', async (request, reply, error) => {
        apm.setTransactionName(request.method + ' ' + request.url);
    });

    // global hook error handling for unhandled error
    server.addHook('onError', async (request, reply, error) => {
        const { message, stack } = error;
        let err = {

            method: request.routerMethod,
            path: request.routerPath,
            param: request.body,
            message,
            stack
        };

        apm.captureError(JSON.stringify(err));
    });

    // main
    const start = async () => {
        try {
            await server.listen(port)
            server.blipp();
            server.log.info(`server listening on ${JSON.stringify(server.server.address())}`);
            resolve(server);
        } catch (err) {
            server.log.error(err);
            reject(err);
            process.exit(1);
        }
    };
    start();
});