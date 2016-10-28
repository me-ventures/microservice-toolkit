'use strict';

var url = require('url');

module.exports.meGET = function meGET (req, res, next) {
    return res.json({hello: 'world'});
};
