import {isNullOrUndefined} from "util";


const rabbitmq = require('amqplib');
const log = require('winston');

let open;
let channel;


export function init( config: RabbitMQContextConfig ){
    open = rabbitmq.connect('amqp://' + config.host)
        .then(x => x,
            error => {
                log.error(error);
                process.exit(1);
            });

    channel = open.then(connection => connection.createChannel());

    return module.exports;
}

export function connectExchange(name, topics, handler) {

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

export function connectExchangeSharedQueue(name, topics, queueName, handler, options) {
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

export function publishToExchange(name, key, message) {
    if ( isNullOrUndefined(message) ) {
        throw new Error(
            `attempted to publish undefined message on exchange [${name}] [${key}]`
        );
    }

    channel.then(function(channel) {
        channel.assertExchange(name, 'direct', {durable: true});
        return channel.publish(name, key, new Buffer(JSON.stringify(message)))
    }).catch(console.warn);
}

export function acknowledge(message) {
    channel.then(channel => {
        channel.ack(message)
    })
}


export interface RabbitMQContextConfig {
    host: string
}
