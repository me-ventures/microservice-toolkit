var lynx = require('lynx');

var metrics;
var metricPrefix;


export function init( config: MetricsConfig ){
     metrics = new lynx(config.host, config.port);
     metricPrefix = config.prefix + ".";

     return module.exports;
}

export function gauge(name, value) {
    metrics.gauge(metricPrefix + name, value);
}

export function timing(name, value) {
    if(metrics !== undefined) {
        metrics.timing(metricPrefix + name, value)
    }
}

export function increment(name) {
    if(metrics !== undefined) {
        metrics.increment(metricPrefix + name)
    }
}

export interface MetricsConfig {
    host: string,
    port: number,
    prefix: string
}
