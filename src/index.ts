// import { FastifyInstance } from "fastify";
import { createServer } from './server'

createServer()
    .then((server: any) => {
        server.log.info('Server started.');

        server.redis.set('test', 'Connected', "EX", server.conf.expireToken, (err, val) => {
            if (err) {
                server.log.info('Failed to establish Redis Connection.');
                server.log.error(JSON.stringify(err));
            } else {
                server.log.info('Redis Connection has been established successfully.');
            }
        }); 

        const apmServerStatus = server.apm.isStarted();
        if (apmServerStatus) {
            server.log.info('Server connected to APM Server');
        } else {
            server.log.info('Server not connected to APM Server');
        }

    }).catch(error => {
        // do something
        console.log(error);
    });