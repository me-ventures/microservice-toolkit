module.exports = {
    init: init,
    checkPermission: checkPermission
};

var request = require('request-promise');
var endpoint;

function init( _endpoint ){
    endpoint = _endpoint;
}

function checkPermission( operation, userId ){
    return request({
        method: 'GET',
        uri: endpoint + `/v1/user/${userId}/hasPermission/${operation}`,
        simple: false,
        resolveWithFullResponse: true
    }).then(res => {
        return res.statusCode === 200;
    });
}
