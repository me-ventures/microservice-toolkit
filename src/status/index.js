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

function init( statusConfig, fullConfig ){
    statusConfig = statusConfig || {};
    statusConfig.port = statusConfig.port || 11111;

    if( typeof statusConfig.service !== 'object' || ! statusConfig.service.name ){
        throw new Error("service.name must be set");
    }

    provider.setServiceInformation(statusConfig.service.name);

    if( typeof fullConfig === 'object' ){
        provider.setHttpEndpointsFromConfig(fullConfig);
    }

    initHttpEndpoint(statusConfig);
}

function shutdown(){
    httpEndpoint.close();
}

function initHttpEndpoint( config ){
    httpEndpoint = app.listen(config.port);
    app.use('/', require('./routes'));
}




