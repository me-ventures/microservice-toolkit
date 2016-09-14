module.exports = {
    /**
     * @deprecated Use the separate initialization inside the modules.
     */
    init: init,
    initFromConfig: initFromConfig,
    http: require('./src/http'),
    metrics: require('./src/metrics'),
    context: require('./src/context'),
    status: require('./src/status')
};

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
        context: require('./src/context').init(config.context)
    }
}

function initFromConfig( config ){
    for( var key in config ){
        var option = config[key];

        switch( key ){
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
                require('./src/status').init(option);
                break;
        }
    }

    return module.exports;
}
