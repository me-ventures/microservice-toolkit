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

var fs = require('fs');
var path = require('path');
var jsyaml = require('js-yaml');


module.exports = {
    initFromConfig: initFromConfig,
    authorization: require('./src/authorizaion'),
    http: require('./src/http'),
    metrics: require('./src/metrics'),
    context: require('./src/context'),
    status: require('./src/status'),
    logger: require('./src/logger')
};



function initFromConfig( config: Config ){
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
                require('./src/status').init(option, config);
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

                require('./src/http').enableSwagger(swaggerDoc, config.swagger);
                break;
        }
    }

    return module.exports;
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


