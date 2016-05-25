module.exports = {
    init: init
};

function init( config ){
    return {
        http: require('./src/http'),
        metrics: require('./src/metrics').init(config.metrics),
        context: require('./src/context').init(config.context)
    }
}
