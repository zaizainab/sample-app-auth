export const RedisTO = {
    description: 'Redis',
    tags: ['Redis'],
    summary: 'add redis data',
    body: {
        type: 'object',
        properties: {
            key: { type: 'string' },
            value: { type: 'string' },
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                data: { type: 'string' },
            }
        }
    }
}

