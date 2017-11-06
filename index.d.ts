declare module "microservice-toolkit" {
    export function initFromConfig( config : Config ): Toolkit
    export let authorization: Authorization;
    export let http: Http;
    export let metrics: Metrics;
    export let context: Context;
    export let status: Status;
    export let logger: Logger;

    export interface Toolkit {
        initFromConfig( config : Config ): Toolkit,
        authorization: Authorization,
        http: Http,
        metrics: Metrics,
        context: Context,
        status: Status,
        logger: Logger
    }


    export interface Authorization {
        init(endpoint : string) : void
        checkPermission( operation: string, userId: number) : Promise<boolean>
    }

    export interface Http {
        listen(port: number) : void,
        addRouter(endpointName : string, route: any) : void
        addMiddleware( middleware : any) : void
        enableSwagger(swaggerDoc: any, SwaggerConfig : SwaggerConfig) : void,
        getApp() : any
    }

    export interface Metrics {
        init(config: MetricsConfig) : Metrics
        gauge(name: string, value: number) : void
        timing(name : string, value : number) : void
        increment(name : string) : void
    }

    export interface Context  {
        init(config : ContextConfig) : Context
        consume(exchangeName: string, topics: string[], handler: (message: any) => Promise<any>) : void
        consumeShared(exchangeName: string, topics: string[], queueName: string, handler: (message: any) => Promise<any>, prefetchCount ?: number) : void
        publishToExchange(exchange: string, key: string, message : any) : void
    }

    export interface Status {
        init(config : StatusConfig, fullConfig ?: Config) : void
        shutdown() : void
        getProvider() : any
    }

    export interface Logger {
        init(config : LoggerConfig): Logger,
        emerg(message : string) : void,
        alert(message : string): void,
        crit(message : string): void,
        error(message : string): void,
        warning(message : string): void,
        notice(message : string): void,
        info(message : string): void,
        debug(message : string): void
    }

    /**
     * Config interfaces
     */
    export interface Config {
        name : string,
        authorization ?: AuthorizationConfig,
        http ?: HttpConfig,
        metrics ?: MetricsConfig,
        context ?: ContextConfig,
        status ?: StatusConfig,
        logger ?: LoggerConfig,
        swagger ?: SwaggerConfig,

        // other values may also be present in config
        [index: string]: any
    }

    export interface HttpConfig {
        port: number
    }

    export interface AuthorizationConfig {
        endpoint: string
    }

    export interface MetricsConfig {
        host: string,
        port: number,
        prefix: string
    }

    export interface ContextConfig {
        rabbitmq ?: RabbitMQContextConfig
    }

    export interface RabbitMQContextConfig {
        host: string
    }

    export interface StatusConfig {
        port: number,
        service: {
            name: string
        }
    }

    export interface LoggerConfig {
        module: string
    }

    export interface SwaggerConfig {
        docPath: string,
        swaggerUi: string,
        controllers: string,
        useStubs: boolean
    }
}
