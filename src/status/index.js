module.exports = {
    init: init
};

var express = require('express');
var app = express();
var log = require('winston');


function init( config ){
    config = config || {
        port: 11111
    };

    initHttpEndpoint(config);

}

function initHttpEndpoint( config ){
    app.listen(config.port);
    app.use('/', require('./routes'));

}




