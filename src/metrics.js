module.exports = {
    init: init,
    gauge: gauge,
    timing: timing,
    increment: increment
};

var lynx = require('lynx');

var metrics;
var metricPrefix;

function init( config ){
     metrics = new lynx(config.host, config.port);
     metricPrefix = config.prefix + ".";

     return module.exports;
}

function gauge(name, value) {
    metrics.gauge(metricPrefix + name, value);
}

function timing(name, value) {
    if(metrics !== undefined) {
        metrics.timing(metricPrefix + name, value)
    }
}

function increment(name) {
    if(metrics !== undefined) {
        metrics.increment(metricPrefix + name)
    }
}

