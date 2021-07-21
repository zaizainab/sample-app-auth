import fp from 'fastify-plugin';

import { RedisOperation } from '../../services/redis-service';
import { RedisTO } from './schema';

export default fp((server, opts, next) => {

    server.post("/redis/addValueToList", { schema: RedisTO }, (request, reply) => {
        try {
            const redis = new RedisOperation(server);
            const { key, value } = request.body;

            redis.setValueToList(key, value)
                .then(res => {
                    return reply.code(200).send({
                        success: true,
                        message: res,
                        res,
                    });
                })
                .catch(error => {
                    return reply.code(400).send({
                        success: false,
                        message: error
                    });
                })
        } catch (error) {
            server.apm.captureError({
                method: request.routerMethod,
                path: request.routerPath,
                param: request.body,
                error,
            })

            request.log.error(error);
            return reply.send(400);
        }
    });

    next();
});