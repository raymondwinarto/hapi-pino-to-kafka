// This file is a modified version of kafka-node/lib/produceStream.js (package version 2.1.0)
// https://github.com/SOHU-Co/kafka-node/blob/c7106593f700700bed2d12cb248e6cb4ee182dca/lib/producerStream.js
// _write() and _writev() has been modified to work with hapi-pino plugin
// was causing error in node_modules/kafka-node/lib/baseProducer.js:127:17
//   p.partition = p.hasOwnProperty('partition')
//   TypeError: Cannot create property 'partition' on string
//   - the payload is string instead of JSON as expected by
//   https://github.com/SOHU-Co/kafka-node/tree/c7106593f700700bed2d12cb248e6cb4ee182dca#sendpayloads-cb

const { Writable } = require('stream');
const _ = require('lodash');
const { KafkaClient, HighLevelProducer } = require('kafka-node');

const DEFAULTS = {
  kafkaClient: {
    kafkaHost: '127.0.0.1:9092',
  },
  producer: {
    partitionerType: 3,
  },
};

const DEFAULT_HIGH_WATER_MARK = 100;

class ProducerStream extends Writable {
  constructor(options) {
    if (options == null) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }

    super({
      objectMode: true,
      decodeStrings: false,
      highWaterMark: options.highWaterMark || DEFAULT_HIGH_WATER_MARK,
    });

    _.defaultsDeep(options, DEFAULTS);

    this.client = new KafkaClient(options.kafkaClient);
    this.producer = new HighLevelProducer(
      this.client,
      options.producer,
      options.producer.customPartitioner,
    );
    this.producer.on('error', (error) => this.emit('error', error));
  }

  sendPayload(payload, callback) {
    if (!_.isArray(payload)) {
      // eslint-disable-next-line no-param-reassign
      payload = [payload];
    }
    if (!this.producer.ready) {
      this.producer.once('ready', () => this.producer.send(payload, callback));
    } else {
      this.producer.send(payload, callback);
    }
  }

  close(callback) {
    this.producer.close(callback);
  }

  // eslint-disable-next-line no-underscore-dangle
  _write(message, encoding, callback) {
    const kafkaMessage = {
      topic: 'raymondtopic',
      messages: message,
    };
    this.sendPayload(kafkaMessage, callback);
  }

  // eslint-disable-next-line no-underscore-dangle
  _writev(chunks, callback) {
    const payload = _.map(chunks, 'chunk');
    const kafkaMessage = {
      topic: 'raymondtopic',
      messages: payload,
    };
    this.sendPayload(kafkaMessage, callback);
  }
}

module.exports = ProducerStream;
