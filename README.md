# hapi-pino-to-kafka
Getting started HAPI project with just one route that uses `hapi-pino` for logging which pushes to Kafka stream rather than `process.stdout`.

`kafkaProducerStream.js` was a manual fork of https://github.com/SOHU-Co/kafka-node/blob/c7106593f700700bed2d12cb248e6cb4ee182dca/lib/producerStream.js
to avoid `node_modules/kafka-node/lib/baseProducer.js:127` from throwing error due to trying to add a `partition` key to a string object.

Kafka server needs to be available from `localhost:9093`
