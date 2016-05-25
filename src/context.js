module.exports = {
    init: init,
    consume: consume,
    publishToExchange
};

var rabbitmq = require('./event-bus/rabbitmq');
var log = require('winston');
var moment = require('moment');
var metrics = require('./metrics');
var uuid = require('node-uuid');

var correlationStore = {};


function init( config ){
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
function consume(exchangeName, topics, handler) {
    // Setup chain
    var messageHandler = function(message) {
        chain(message, handler)
    };

    rabbitmq.connectExchange(exchangeName, topics, messageHandler)
}

function publishToExchange(exchange, key, message) {
    rabbitmq.publishToExchange(exchange, key, message)
}

function chain(message, next) {
    jsonDecoder(message)
        .then(checkCorrelationId)
        .then(next)
        .then(msg => timeRequest(msg))
        .then(_ => rabbitmq.acknowledge(message))
        .catch(log.error)
}

function jsonDecoder(message) {
    return new Promise((resolve, reject) => {
        try {
            return resolve(JSON.parse(message.content.toString()))
        }
        catch (e) {
            return reject(e)
        }
    })
}

function checkCorrelationId(message) {
    if(typeof message.correlationId != 'string') {
        message.correlationId = uuid.v4();
    }

    correlationStore[message.correlationId] = moment();

    return message;
}

function timeRequest(message) {
    if(typeof message.correlationId != 'string') {
        return log.error("No correlation present in message: " + JSON.stringify(message))
    }

    var object = correlationStore[message.correlationId];

    metrics.timing("process-time", moment().diff(object))
}