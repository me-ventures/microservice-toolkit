module.exports = {
    listen: listen,
    addRouter: addRouter
};


var express = require('express');
var morgan = require('morgan');
var log = require('winston');
var metrics = require('./metrics');
var app = express();

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