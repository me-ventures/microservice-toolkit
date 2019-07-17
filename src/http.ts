var express = require('express');
var morgan = require('morgan');
var log = require('winston');
var metrics = require('./metrics');
var app = express();
var swaggerTools = require('swagger-tools');


app.use(logResponseCode);

export function listen( port: number ){
    return init({ port: port});
}

export function init( config: HttpConfig ) {
    if( config.logOnlyErrors && ! config.logOnlyErrors ) {
        app.use(morgan('combined'));
    } else {
        app.use(morgan('combined', {
            skip: function (req, res) { return res.statusCode < 400 }
        }));
    }

    return app.listen(config.port, function () {
        log.info('Listening on port ' + config.port);
    });
}

export function addRouter( endpointName, route ){
    app.use(endpointName, route);
}

export function addMiddleware( middleware ){
    app.use(middleware);
}

export function enableSwagger( swaggerDoc, options ){
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        if(options.security) {
            app.use(middleware.swaggerSecurity(options.security))
        }

        if(options.enableCors && options.enableCors === true) {
            
        }

        // Validate Swagger requests
        app.use(middleware.swaggerValidator());

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter(options));

        // Serve the Swagger documents and Swagger UI
        app.use(middleware.swaggerUi());
    });
}

export function logResponseCode(req, res, next) {
    var rEnd = res.end;

    // Proxy the real end function
    res.end = function(chunk, encoding) {
        // Do the work expected
        res.end = rEnd;
        res.end(chunk, encoding);
        
        var baseName = "http.responses.";

        metrics.increment(baseName + res.statusCode)
    };

    next()
}

export function getApp() {
    return app;
}

export interface HttpConfig {
    port: number;

    logOnlyErrors ?: boolean;
}
