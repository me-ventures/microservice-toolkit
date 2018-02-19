module.exports = {
    init: init,
    connectExchange: connectExchange,
    connectExchangeSharedQueue: connectExchangeSharedQueue,
    publishToExchange: publishToExchange,
    acknowledge: acknowledge
};


var rabbitmq = require('amqplib');
var log = require('winston');

var open;
var channel;


function init( config ){
    open = rabbitmq.connect('amqp://' + config.host)
        .then(x => x,
            error => {
                log.error(error);
                process.exit(1);
            });

    channel = open.then(connection => connection.createChannel());

    return module.exports;
}

function connectExchange(name, topics, handler) {

    if(Array.isArray(topics) === false) {
        throw { message: "Topics should be array."}
    }

    channel
        .then(chan => {
            chan.assertExchange(name, 'direct', {durable: true});

            return chan.assertQueue('', {exclusive: true})
                .then(q => {
                    return {
                        channel: chan,
                        queue: q
                    };
                });
        })
        .then(object => {
            topics.forEach(routingKey => {
                object.channel.bindQueue(object.queue.queue, name, routingKey)
            });

            object.channel.consume(object.queue.queue, handler)
        })
        .catch(x => {
            log.error(x)
        } )
}

function connectExchangeSharedQueue(name, topics, queueName, handler, options) {
    if(Array.isArray(topics) === false) {
        throw { message: "Topics should be array."}
    }

    channel
        .then(chan => {
            chan.assertExchange(name, 'direct', {durable: true});

            if(options.prefetch) {
                chan.prefetch(options.prefetch);
            }
            else {
                chan.prefetch(1);
            }

            return chan.assertQueue(queueName, {durable: true})
                .then(q => {
                    return {
                        channel: chan,
                        queue: q
                    };
                });
        })
        .then(object => {
            topics.forEach(routingKey => {
                object.channel.bindQueue(object.queue.queue, name, routingKey)
            });

            object.channel.consume(object.queue.queue, handler)
        })
        .catch(x => {
            log.error(x)
        } )
}

function publishToExchange(name, key, message) {

    if ( message == undefined ) {
        throw new Error(
            `attempted to publish undefined message on exchange [${name}] [${key}]`
        );
    }

    channel.then(function(channel) {
        channel.assertExchange(name, 'direct', {durable: true});
        return channel.publish(name, key, new Buffer(JSON.stringify(message)))
    }).catch(console.warn);
}

function acknowledge(message) {
    channel.then(channel => {
        channel.ack(message)
    })
}
