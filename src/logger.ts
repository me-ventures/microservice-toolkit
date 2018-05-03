const logger = require('./logger/console-logger');
const metrics = require('./metrics');

let instance;


export function init(config ?: LoggerConfig) {
    var moduleName;

    if( config ){
        moduleName = config.module;
        setHandlers(config.unhandledExceptionHandler, config.enableUnhandledRejectionHandler);
    } else {
        moduleName = 'default-unnamed-module';
    }

    instance = logger.init(moduleName);

    // for legacy functionality
    return {
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
    crit(`Unhandled exception: ${error.message}`);
    crit(error.stack.toString());
    process.exit(1);
}

/**
 * Handler for the unhandledRejection event. Will print out a warning message using the log system.
 */
function unhandledRejectionHandler(error) {
    let reasonString = error.message || error.msg || JSON.stringify(error);

    crit(`Unhandled Promise Rejection - reason: [${reasonString}]`);
    crit(error.stack.toString());
}

export interface LoggerConfig {
    module: string;

    unhandledExceptionHandler ?: boolean;
    enableUnhandledRejectionHandler ?: boolean;
}
