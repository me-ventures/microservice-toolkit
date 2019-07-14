var express = require('express');
var router = express.Router();

var validator = require('is-my-json-valid');

var provider = require('./provider/index');

router.get('/status', function(req, res){
    res.status(200).json(provider.getData());
});

export function getRouter() {
    return router;
}
