import * as authorization from "./authorizaion";
import { AuthorizationConfig } from "./authorizaion";
import * as context from "./context";
import { ContextConfig } from "./context";
import * as http from "./http";
import { HttpConfig } from "./http";
import * as metrics from "./metrics";
import { MetricsConfig } from "./metrics";
import * as logger from "./logger";
import { LoggerConfig } from "./logger";
import * as status from "./status";
import { StatusConfig } from "./status";

var fs = require('fs');
var path = require('path');
var jsyaml = require('js-yaml');


module.exports = {
    initFromConfig: initFromConfig,
    authorization: authorization,
    http: http,
    metrics: metrics,
    context: context,
    status: status,
    logger: logger,
} as Toolkit;



export function initFromConfig( config: Config ){
    for( const key in config ){
        const option = config[key];

        switch( key ){
            case 'authorization':
                authorization.init(option.endpoint);
                break;

            case 'http':
                http.listen(option.port);
                break;

            case 'metrics':
                metrics.init(option);
                break;

            case 'context':
                context.init(option);
                break;

            case 'status':
                status.init(option, config);
                break;

            case 'logger':
                logger.init(option);
                break;

            case 'swagger':
                const spec = fs.readFileSync(
                    config.swagger.docPath, 'utf8'
                );

                let swaggerDoc;
                switch( path.extname(config.swagger.docPath) ){
                    case '.yml':
                    case '.yaml':
                        swaggerDoc = jsyaml.safeLoad(spec);
                        break;

                    case '.json':
                        swaggerDoc = JSON.parse(spec);
                        break;

                    default:
                        throw new Error(
                            "'swagger.docPath must be json or yml"
                        );
                }

                http.enableSwagger(swaggerDoc, config.swagger);
                break;
        }
    }

    return module.exports as Toolkit;
}

export interface Toolkit {
    initFromConfig( config : Config ): Toolkit,
    authorization: Authorization,
    http: Http,
    metrics: Metrics,
    context: Context,
    status: Status,
    logger: Logger
}

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

export interface SwaggerConfig {
    docPath: string,
    swaggerUi: string,
    controllers: string,
    useStubs: boolean
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


