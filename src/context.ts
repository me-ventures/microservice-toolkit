import { RabbitMQContextConfig } from "./event-bus/rabbitmq";

var rabbitmq = require('./event-bus/rabbitmq');
var log = require('winston');
var moment = require('moment');
var metrics = require('./metrics');
var uuid = require('uuid');
var statusProvider = require('./status/index').getProvider();


var correlationStore = {};


export function init( config: ContextConfig ){
    rabbitmq.init(config.rabbitmq);

    return module.exports;
}

/**
 * Create a consume function for an exchange.
 *
 * Handler should return a promise and accept a message. If this is reject promise the message is not acknowledged. If
 * the resolves it should contain the original message.
 *
 * @param exchangeName
 * @param topics
 * @param handler
 */
export function consume(exchangeName, topics, handler) {
    // Setup chain
    var messageHandler = function(message) {
        // make sure we don't have things like buffers
        message.content = JSON.parse(message.content.toString());

        topics.forEach(function(topic){
            statusProvider.setEventConsumeExample(
                exchangeName,
                topic,
                message.content
            );
        });

        chain(message, handler)
    };

    rabbitmq.connectExchange(exchangeName, topics, messageHandler);

    // add consume events to status provider
    topics.forEach(function(topic){
        statusProvider.addEventConsume(exchangeName, topic, false);
    });
}

/**
 * Create a consume function for an exchange using a shared queue. This queue can be used by other workers and the messages
 * will be shared round-robin.
 *
 * Handler should return a promise and accept a message. If this is reject promise the message is not acknowledged. If
 * the resolves it should contain the original message.
 *
 * @param exchangeName
 * @param topics
 * @param queueName
 * @param handler
 * @param fetchCount
 */
export function consumeShared(exchangeName, topics, queueName, handler, fetchCount = 1) {
    var messageHandler = function(message) {
        // make sure we don't have things like buffers
        message.content = JSON.parse(message.content.toString());

        topics.forEach(function(topic){
            statusProvider.setEventConsumeExample(
                exchangeName,
                topic,
                message.content
            );
        });

        chain(message, handler)
    };

    rabbitmq.connectExchangeSharedQueue(exchangeName, topics, queueName, messageHandler, { prefetch: fetchCount });

    // add consume events to status provider
    topics.forEach(function(topic){
        statusProvider.addEventConsume(exchangeName, topic, true, queueName);
    });
}

export function publishToExchange(exchange, key, message) {
    metrics.increment("message-sent");

    rabbitmq.publishToExchange(exchange, key, message)

    // add publish event to status provider
    statusProvider.addEventPublish(exchange, key);
    statusProvider.setEventPublishExample(exchange, key, message);
}

export function chain(message, next) {
    metrics.increment("message-received");

    Promise.resolve(checkCorrelationId(message.content))
        .then(next)
        .then(msg => timeRequest(msg))
        .then(_ => rabbitmq.acknowledge(message))
        .catch(log.error)
}

export function checkCorrelationId(message) {
    if(typeof message.correlationId != 'string') {
        message.correlationId = uuid.v4();
    }

    correlationStore[message.correlationId] = moment();

    return message;
}

export function timeRequest(message) {
    if(typeof message.correlationId != 'string') {
        return log.error("No correlation present in message: " + JSON.stringify(message))
    }

    var object = correlationStore[message.correlationId];

    metrics.timing("process-time", moment().diff(object))

    // clean up correlationStore object
    delete correlationStore[message.correlationId];
}

export interface ContextConfig {
    rabbitmq ?: RabbitMQContextConfig
}
