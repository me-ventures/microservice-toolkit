var assert = require('chai').assert;
var sut = require('../../../index');
var fs = require('fs');
var request = require('request');

describe('toolkit.initFromConfig', function(){
    it('should initialize all components present in supplied config', function(done){
        this.timeout = 10000;

        sut.initFromConfig({
            "name": "public-product-frontend-layer",
            "http": {
                "port": 8000
            },
            "metrics": {
                "host": "localhost",
                "port": 8125,
                "prefix": "public-product-frontend-layer"
            },
            "context": {
                "rabbitmq": {
                    "host": "localhost"
                }
            },
            "status": {
                "service": {
                    "name": "test-service"
                },
                "port": 10088
            }
        });

        sut.http.addRouter('/test', function(req,res,next){
            res.json({hello: 'world'});
        });

        request('http://localhost:8000/test', function(err, res, body){
            body = JSON.parse(body);

            assert.equal(res.statusCode, 200);
            assert.equal(body.hello, 'world');

            done();
        });
    });
});

