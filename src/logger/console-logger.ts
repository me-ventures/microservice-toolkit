var winston = require('winston');
var moment = require('moment');

export function init( module ){
    var instance = new winston.Logger({
        transports: [new winston.transports.Console({
            label: getLabel(module),
            formatter: formatMessage
        })]
    });

    instance.setLevels(winston.config.syslog.levels);

    return instance;
}

// Setup logging
function formatMessage(args) {
    return (
        `[${moment().format()}] [${args.level}] [${args.label}] `
        + `${parseMessage(
            Object.keys(args.meta).length > 0 
                ? args.meta
                : args.message
        )}`
    ) + '\r\n'
}

function parseMessage( message ){
    if( typeof message === 'string' || typeof message === 'number' ){
        return message;
    }

    if( typeof message === 'object' ){
        if( typeof message.message === 'string' ){
            return message.message;
        }

        return JSON.stringify(message);
    }
}

function getLabel(module) {
    if( typeof module !== 'string'  ){
        return 'no-label';
    }

    return module;
}

