var express = require('express');
var app = express();
var log = require('winston');
var httpEndpoint;

import * as routes from "./routes";
import * as provider from "./provider/index";

export function getProvider(){
    return provider;
}

export function init( statusConfig ?: StatusConfig|any, fullConfig ?: any ){
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

export function shutdown(){
    httpEndpoint.close();
}

export function initHttpEndpoint( config ){
    httpEndpoint = app.listen(config.port);
    app.use('/', routes.getRouter());
}

export interface StatusConfig {
    port: number,
    service: {
        name: string
    }
}


