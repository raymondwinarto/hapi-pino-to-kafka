const Hapi = require('@hapi/hapi');
const Pino = require('hapi-pino');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  // Add the route
  server.route({
    method: 'GET',
    path: '/',
    async handler(request, h) {
      // we don't want standard logging (we want to use pino)
      // request.log(['a', 'b'], 'Request into hello world');

      // you can also use a pino instance, which will be faster
      request.logger.info('In handler %s', request.path);

      return 'hello world';
    },
  });

  await server.register({
    plugin: Pino,
    options: {
      // we don't want to pretty print because we want to push it to stream
      // prettyPrint: process.env.NODE_ENV !== 'production',

      // Redact Authorization headers, see https://getpino.io/#/docs/redaction
      redact: ['req.headers.authorization'],
    },
  });

  await server.start();

  // we don't want standard logging (we want to use pino)
  // server.log(['subsystem'], `Server running on ${server.info.uri}`);

  server.logger.info(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});

init();
