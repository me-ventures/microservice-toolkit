module.exports = {
    listen: listen,
    addRouter: addRouter,
    addMiddleware: addMiddleware,
    enableSwagger: enableSwagger,
    getApp: getApp
};


var express = require('express');
var morgan = require('morgan');
var log = require('winston');
var metrics = require('./metrics');
var app = express();
var swaggerTools = require('swagger-tools');

app.use(morgan('combined'));
app.use(logResponseCode);

function listen( port ){
    app.listen(port, function () {
        log.info('Listening on port ' + port);
    });
}

function addRouter( endpointName, route ){
    app.use(endpointName, route);
}

function addMiddleware( middleware ){
    app.use(middleware);
}

function enableSwagger( swaggerDoc, options ){
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

function logResponseCode(req, res, next) {
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

function getApp() {
    return app;
}