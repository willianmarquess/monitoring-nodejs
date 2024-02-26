export default (fastify, promClient, promRegister) => {
    const metrics = new Map();

    const httpRequestDurationHistogram = new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in ms',
        labelNames: ['method', 'route', 'code'],
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    promRegister.registerMetric(httpRequestDurationHistogram);

    fastify.addHook('onRequest', (request, _, done) => {
        const timer = httpRequestDurationHistogram.startTimer();

        const { url, method, id } = request.routeConfig;

        if(url === '/metrics') {
            return done();
        };

        metrics.set(`${method}${url}${id}`, timer);

        done();
    });

    fastify.addHook('onResponse', (request, reply, done) => {
        const { url, method, id } = request.routeConfig;

        if(url === '/metrics') { 
            return done();
        }

        const timer = metrics.get(`${method}${url}${id}`);

        const { statusCode } = reply;

        timer({
            method,
            route: url,
            code: statusCode
        });

        done();
    });
}