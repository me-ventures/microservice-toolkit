module.exports = {
    /**
     * @deprecated Use the separate initialization inside the modules.
     */
    init: init,
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
