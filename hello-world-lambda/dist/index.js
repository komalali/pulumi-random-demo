"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    const path = event.path;
    const method = event.httpMethod;
    // Handle different routes
    if (method === 'GET') {
        if (path === '/' || path === '/hello') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: 'hello world',
            };
        }
        if (path === '/health') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    message: 'Lambda function is running correctly'
                }),
            };
        }
    }
    // Default 404 response
    return {
        statusCode: 404,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            error: 'Not Found',
            message: `Path ${path} not found`,
        }),
    };
};
exports.handler = handler;
//# sourceMappingURL=index.js.map