const logger = require('./logger/console-logger');
const metrics = require('./metrics');

let instance;

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
    var moduleName;

    if( config ){
        moduleName = config.module;
        setHandlers(config.unhandledExceptionHandler, config.enableUnhandledRejectionHandler);
    } else {
        moduleName = 'default-unnamed-module';
    }

    instance = logger.init(moduleName);

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

/**
 * Set handlers for the uncaughtException and unhandledRejection events in nodejs.
 *
 * @param enableException boolean
 * @param enableUnhandled boolean
 */
function setHandlers(enableException, enableUnhandled) {
    if(enableException === true) {
        process.on('uncaughtException', UncaughtExceptionHandler);
    }

    if(enableUnhandled === true) {
        process.on('unhandledRejection', unhandledRejectionHandler);
    }
}

/**
 * Handler for the uncaught exception event inside nodejs. It will print out a critical error message and will then
 * exit the application.
 */
function UncaughtExceptionHandler(error) {
    // Call module.exports.crit here so that we can intercept the call in the tests
    module.exports.crit(`Unhandled exception: ${error.message}`);
    process.exit(1);
}

/**
 * Handler for the unhandledRejection event. Will print out a warning message using the log system.
 */
function unhandledRejectionHandler(reason, promise) {

    // if the reason is an object, output the message, or failing that, JSON
    if (typeof reason === 'object' ){
        reason = reason.message || reason.msg || JSON.stringify(reason);
    }

    // if the promise is an object, output it in JSON format
    if (typeof promise === 'object' ){
        promise = 'promise: ' + JSON.stringify(promise);
    }

    module.exports.warning(`Unhandled Rejection at: ${promise} - reason: ${reason}`);
}