const Hapi = require('@hapi/hapi');
const Pino = require('hapi-pino');

const KafkaProducerStream = require('./kafkaProducerStream');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    // The host property set to localhost is likely the safest choice.
    // In a docker container, however, the localhost may not be accessible
    // outside of the container and using host: '0.0.0.0' may be needed.
    host: '0.0.0.0',
  });

  server.route({
    method: 'GET',
    path: '/',
    async handler(request) {
      const { text = 'hello world' } = request.query;

      // we don't want standard logging (we want to use pino)
      // request.log(['a', 'b'], 'Request into hello world');

      // you can also use a pino instance, which will be faster
      request.logger.info('In handler %s, TEXT value is %s', request.path, text);

      return text;
    },
  });

  const kafkaProducerStream = new KafkaProducerStream({
    kafkaClient: { kafkaHost: 'kafka:9092' },
  });

  await server.register({
    plugin: Pino,
    options: {
      // we don't want to pretty print because we want to push it to stream
      // prettyPrint: process.env.NODE_ENV !== 'production',

      // Redact Authorization headers, see https://getpino.io/#/docs/redaction
      redact: ['req.headers.authorization'],
      stream: kafkaProducerStream,
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
