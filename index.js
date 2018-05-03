module.exports = {
    /**
     * @deprecated Use the separate initialization inside the modules.
     */
    init: init,
    initFromConfig: initFromConfig,
    authorization: require('./src/authorizaion/index'),
    http: require('./src/http'),
    metrics: require('./src/metrics'),
    context: require('./src/context'),
    status: require('./src/status'),
    logger: require('./src/logger')
};

var fs = require('fs');
var path = require('path');
var jsyaml = require('js-yaml');

/**
 *
 * @param config
 * @returns {{http: *, metrics: *, context: *}}
 * @deprecated
 */
function init( config ){
    return {
        http: require('./src/http'),
        metrics: require('./src/metrics').init(config.metrics),
        context: require('./src/context').init(config.context),
        logger: require('./src/logger').init(config.logger)
    }
}

function initFromConfig( config ){
    for( var key in config ){
        var option = config[key];

        switch( key ){
            case 'authorization':
                require('./src/authorizaion/index').init(option.endpoint);
                break;

            case 'http':
                require('./src/http').listen(option.port);
                break;

            case 'metrics':
                require('./src/metrics').init(option);
                break;

            case 'context':
                require('./src/context').init(option);
                break;

            case 'status':
                require('./src/status').init(option, config);
                break;

            case 'logger':
                require('./src/logger').init(option);
                break;

            case 'swagger':
                var spec = fs.readFileSync(
                    config.swagger.docPath, 'utf8'
                );

                var swaggerDoc;
                switch( path.extname(config.swagger.docPath) ){
                    case '.yml':
                    case '.yaml':
                        swaggerDoc = jsyaml.safeLoad(spec);
                        break;

                    case '.json':
                        swaggerDoc = JSON.parse(spec);
                        break;

                    default:
                        throw new Error({
                            message: 'swagger.docPath must be json or yml'
                        });
                }

                require('./src/http').enableSwagger(swaggerDoc, config.swagger);
                break;
        }
    }

    return module.exports;
}
