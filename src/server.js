import Fastify from 'fastify';
import promClient from 'prom-client';

import FastifyMetricsModule from './FastifyMetricsModule.js';

const promRegister = new promClient.Registry();

promRegister.setDefaultLabels({
    app: 'nodejs-application'
});

promClient.collectDefaultMetrics({
    register: promRegister
});

const app = Fastify({
    logger: true
});

app.get('/metrics', async () => {
    return await promRegister.metrics();
});

app.get('/users', () => {
    return [];
});

app.get('/products', () => {
    return [];
});

app.get('/payment', (_, reply) => {
    return reply.status(400).send({
        error: 'error'
    });
});

FastifyMetricsModule(app, promClient, promRegister);

app.listen({
    port: 3333
})
.then(() => app.log.info('server running ❤️‍🔥'))
.catch((error) => {
    app.log.error('error on server starter 😪', error);
    process.exit(1);
});