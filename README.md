# hapi-pino-to-kafka
Getting started HAPI project with just one route that uses `hapi-pino` for logging which pushes to Kafka stream rather than `process.stdout`.

`kafkaProducerStream.js` was a manual fork of https://github.com/SOHU-Co/kafka-node/blob/c7106593f700700bed2d12cb248e6cb4ee182dca/lib/producerStream.js
to avoid `node_modules/kafka-node/lib/baseProducer.js:127` from throwing error due to trying to add a `partition` key to a string object.

Kafka server needs to be available from `localhost:9093`

# Server API
Calling the main route will return the text query value as response but it will also write
request log though hapi-pino which is piped to to the kafka container as producer

## Starting Server
`npm run start:server`

## Routes
- Main route: `http://localhost:3019/?text=<any text>`

# Kafka Container
References: 
- https://hub.docker.com/r/bitnami/kafka/
- https://kafka.apache.org/quickstart

## List all topics
```
docker run -it --rm \
    --network hapi-pino-to-kafka_app-tier \
    -e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 \
    bitnami/kafka:2-debian-10 kafka-topics.sh --list  --zookeeper zookeeper:2181
```

## Create new topic
```
docker run -it --rm \
    --network hapi-pino-to-kafka_app-tier \
    -e KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181 \
    bitnami/kafka:2-debian-10 kafka-topics.sh  \
    --create --zookeeper zookeeper:2181 --replication-factor 1 \
    --partitions 1 --topic raymondtopic
    
```

## Test producer (internally from docker)
```
docker exec -it hapi-pino-to-kafka_kafka_1 bash

/opt/bitnami/kafka/bin/kafka-console-producer.sh \
    --broker-list 127.0.0.1:9092 --topic raymondtopic
```

## Test consumer (internally from docker)
```
docker exec -it hapi-pino-to-kafka_kafka_1 bash

/opt/bitnami/kafka/bin/kafka-console-consumer.sh \
    --bootstrap-server 127.0.0.1:9092 --topic raymondtopic \
    --from-beginning
```

# References
- https://github.com/waldemarnt/node-docker-example

# Notes/Further Readings
- https://github.com/buildkite/nodejs-docker-example
- https://github.com/b00giZm/docker-compose-nodejs-examples
- https://medium.com/@b00giZm/building-the-next-version-of-compose-node-86eef3c23d5b