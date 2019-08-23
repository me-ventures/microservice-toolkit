import { Logger } from "./index";

import * as consoleLogger from "./logger/console-logger";
import * as metrics from "./metrics";

let instance;


export function init(config ?: LoggerConfig): Logger {
    var moduleName;

    if( config ){
        moduleName = config.module;
        enableDefaultHandlers(
            config.enableUnhandledExceptionHandler,
            config.enableUnhandledRejectionHandler
        );
    } else {
        moduleName = 'default-unnamed-module';
    }

    instance = consoleLogger.init(moduleName);

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
        debug: debug,
    };
}

export function emerg(message) {
    metrics.increment('log.emerg');
    instance.emerg(message);
}

export function alert(message) {
    metrics.increment('log.alert');
    instance.alert(message);
}

export function crit(message) {
    metrics.increment('log.crit');
    instance.crit(message);
}

export function error(message) {
    metrics.increment('log.error');
    instance.error(message);
}

export function warning(message) {
    metrics.increment('log.warning');
    instance.warning(message);
}

export function notice(message) {
    metrics.increment('log.notice');
    instance.notice(message);
}

export function info(message) {
    metrics.increment('log.info');
    instance.info(message);
}

export function debug(message) {
    metrics.increment('log.debug');
    instance.debug(message);
}

/**
 * Set handlers for the uncaughtException and unhandledRejection events in nodejs.
 *
 * @param enableException boolean
 * @param enableUnhandled boolean
 */
function enableDefaultHandlers(enableException, enableUnhandled) {
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

    enableUnhandledExceptionHandler ?: boolean;
    enableUnhandledRejectionHandler ?: boolean;
}
