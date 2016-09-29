var logger = require('./logger/console-logger');
var metrics = require('./metrics');

var instance;

module.exports = {
    init: init,
    emerg: emerg,
    alert: alert,
    crit: crit,
    error: error,
    warning: warning,
    notice: notice,
    info: info,
    debug: debug
};

function init(config) {
    var module;

    if( config ){
        module = config.module;
    }

    instance = logger.init(module);

    return module.exports;
}

function emerg(message) {
    metrics.increment('log.emerg');
    instance.emerg(message);
}

function alert(message) {
    metrics.increment('log.alert');
    instance.alert(message);
}

function crit(message) {
    metrics.increment('log.crit');
    instance.crit(message);
}

function error(message) {
    metrics.increment('log.error');
    instance.error(message);
}

function warning(message) {
    metrics.increment('log.warning');
    instance.warning(message);
}

function notice(message) {
    metrics.increment('log.notice');
    instance.notice(message);
}

function info(message) {
    metrics.increment('log.info');
    instance.info(message);
}

function debug(message) {
    metrics.increment('log.debug');
    instance.debug(message);
}