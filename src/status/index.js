module.exports = {
    init: init,
    shutdown: shutdown
};

var express = require('express');
var app = express();
var log = require('winston');
var httpEndpoint;

var info = {};

function init( config ){
    config = config || {
        port: 11111
    };

    info.service = config.service;

    initHttpEndpoint(config);
}

function shutdown(){
    httpEndpoint.close();
}

function initHttpEndpoint( config ){
    httpEndpoint = app.listen(config.port);
    app.use('/', require('./routes'));
}




