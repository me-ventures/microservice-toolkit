module.exports = {
    init: init,
    shutdown: shutdown,
    getProvider: getProvider
};

var express = require('express');
var app = express();
var log = require('winston');
var httpEndpoint;

var provider = require('./provider');

function getProvider(){
    return provider;
}

function init( config ){
    config = config || {};
    config.port = config.port || 11111;

    if( typeof config.service !== 'object' || ! config.service.name ){
        throw new Error("service.name must be set");
    }

    provider.setServiceInformation(config.service.name);

    initHttpEndpoint(config);
}

function shutdown(){
    httpEndpoint.close();
}

function initHttpEndpoint( config ){
    httpEndpoint = app.listen(config.port);
    app.use('/', require('./routes'));
}




