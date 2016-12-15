declare namespace MevToolkit {

    interface Toolkit {
        initFromConfig( config : Config ): Toolkit,
        authorization: Authorization,
        http: Http,
        metrics: Metrics,
        context: Context,
        status: Status,
        logger: Logger
    }


    interface Authorization {
        init(endpoint : string) : void
        checkPermission( operation: string, userId: number) : boolean
    }

    interface Http {
        listen(port: number) : void,
        addRouter(endpointName : string, route: any) : void
        addMiddleware( middleware : any) : void
        enableSwagger(swaggerDoc: any, SwaggerConfig : SwaggerConfig) : void
    }

    interface Metrics {
        init(config: MetricsConfig) : Metrics
        gauge(name: string, value: number) : void
        timing(name : string, value : number) : void
        increment(name : string) : void
    }

    interface Context  {
        init(config : ContextConfig) : Context
        consume(exchangeName: string, topics: string[], handler: (message: any) => Promise<any>) : void
        consumeShared(exchangeName: string, topics: string[], queueName: string, handler: (message: any) => Promise<any>) : void
        publishToExchange(exchange: string, key: string, message : any) : void
    }

    interface Status {
        init(config : StatusConfig) : void
        shutdown() : void
        getProvider() : any
    }

    interface Logger {
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
    interface Config {
        name : string,
        authorization ?: AutorizationConfig,
        http ?: HttpConfig,
        metrics ?: MetricsConfig,
        context ?: ContextConfig,
        status ?: StatusConfig,
        logger ?: LoggerConfig,
        swagger ?: SwaggerConfig
    }

    interface HttpConfig {
        port: number
    }

    interface AutorizationConfig {
        endpoint: string
    }

    interface MetricsConfig {
        host: string,
        port: number,
        prefix: string
    }

    interface ContextConfig {
        rabbitmq ?: RabbitmqContextConfig
    }

    interface RabbitmqContextConfig {
        host: string
    }

    interface StatusConfig {
        port: number,
        service: {
            name: string
        }
    }

    interface LoggerConfig {
        module: string
    }

    interface SwaggerConfig {
        docPath: string,
        swaggerUi: string,
        controllers: string,
        useStubs: boolean
    }
}

declare var toolkit: MevToolkit.Toolkit;

declare module "microservice-toolkit" {
    export = toolkit;
}
