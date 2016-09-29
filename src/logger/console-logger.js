module.exports = {
    init: init,
};

var winston = require('winston');
var moment = require('moment');

function init( module ){
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
        `[${moment().format()}] [${args.level}] [${args.label}] ${parseMessage(args.message)}`
    )
}

function parseMessage( message ){
    if( typeof message === 'string' || typeof message === 'number' ){
        return message;
    }

    if( typeof message === 'object' ){
        if( message.message === 'string' ){
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

