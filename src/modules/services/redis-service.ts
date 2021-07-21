export const setLoginRedis = (param, server) => new Promise((resolve, reject) => {
    const { username, token } = param;

    // key login token
    server.redis.set(username, token, "EX", server.conf.expireToken, (err, val) => {
        if (err) {
            reject(err);
        } else {
            resolve(token);
        }
    })
});

export class RedisOperation {
    // server: any;
    redis: any;
    conf: any;

    constructor(serverInstance) {
        this.redis = serverInstance.redis;
        this.conf = serverInstance.conf;
    }

    setValueToList = (key, value) => new Promise((resolve, reject) => {

        // key login token
        this.redis.sadd(key, value, (err, val) => {
            if (err) {
                reject(err);
            } else {
                resolve(val);
            }
        })
    });
}