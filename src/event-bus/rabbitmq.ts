import {isNullOrUndefined} from "util";


import * as rabbitmq from "amqplib";
import { Channel, Options } from "amqplib";
import * as Bluebird from "bluebird";
const log = require('winston');

let open !: Bluebird<void|rabbitmq.Connection>;
let channel !: Bluebird<Channel>;

let defaultPublishOptions !: Options.Publish;
let defaultConsumeOptions: Options.Consume|undefined;


export function init( config: RabbitMQContextConfig ){
    // optionally set default publish options
    if ( config.defaultPublishOptions ) {
        defaultPublishOptions = config.defaultPublishOptions;
    } else {
        defaultPublishOptions = {
            persistent: true,
        };
    }

    defaultConsumeOptions = config.defaultConsumeOptions;

    open = rabbitmq.connect('amqp://' + config.host)
        .then(x => x,
            error => {
                log.error(error);
                process.exit(1);
            });

    channel = open.then((connection: rabbitmq.Connection)  => connection.createChannel());

    return module.exports;
}

export function connectExchange(
    name: string,
    topics: string[],
    handler: (msg: rabbitmq.ConsumeMessage) => any,
    consumeOptions ?: Options.Consume
) {

    if(Array.isArray(topics) === false) {
        throw { message: "Topics should be array."}
    }

    channel
        .then(async chan => {
            await chan.assertExchange(name, 'direct', {durable: true});

            return chan.assertQueue('', {exclusive: true})
                .then(q => {
                    return {
                        channel: chan,
                        queue: q
                    };
                });
        })
        .then(async object => {
            for (const routingKey of topics) {
                await object.channel.bindQueue(object.queue.queue, name, routingKey);
            }

            await object.channel.consume(
                object.queue.queue,
                handler,
                consumeOptions || defaultConsumeOptions
            );
        })
        .catch(x => {
            log.error(x)
        } )
}

export function connectExchangeSharedQueue(
    name: string,
    topics: string[],
    queueName: string,
    handler: (msg: rabbitmq.ConsumeMessage) => any,
    options: { prefetch ?: number },
    consumeOptions: Options.Consume
) {
    if(Array.isArray(topics) === false) {
        throw { message: "Topics should be array."}
    }

    channel
        .then(async chan => {
            await chan.assertExchange(name, 'direct', {durable: true});

            if(options.prefetch) {
                await chan.prefetch(options.prefetch);
            }
            else {
                await chan.prefetch(1);
            }

            return chan.assertQueue(queueName, {durable: true})
                .then(q => {
                    return {
                        channel: chan,
                        queue: q
                    };
                });
        })
        .then(async object => {
            for (const routingKey of topics) {
                await object.channel.bindQueue(object.queue.queue, name, routingKey);
            }

            await object.channel.consume(
                object.queue.queue,
                handler,
                consumeOptions || defaultConsumeOptions
            );
        })
        .catch(x => {
            log.error(x)
        } )
}

export function publishToExchange(
    name: string,
    key: string,
    message: object,
    options ?: Options.Publish
) {
    if ( isNullOrUndefined(message) ) {
        throw new Error(
            `attempted to publish undefined message on exchange [${name}] [${key}]`
        );
    }

    channel.then(async function(ch) {
        await ch.assertExchange(name, 'direct', {durable: true});

        return ch.publish(
            name,
            key,
            Buffer.from(JSON.stringify(message)),
            options || defaultPublishOptions
        );
    }).catch(log.warn);
}

export function acknowledge(message) {
    channel.then(channel => {
        channel.ack(message)
    })
}


export interface RabbitMQContextConfig {
    host: string,
    defaultPublishOptions ?: Options.Publish,
    defaultConsumeOptions ?: Options.Consume,
}
