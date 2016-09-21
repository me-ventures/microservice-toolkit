var assert = require('chai').assert;
var sut = require('../../../index');
var fs = require('fs');
var request = require('request');
var nock = require('nock');

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

    it('should initialize swagger when present in config', function(done){
        this.timeout = 10000;

        sut.initFromConfig({
            "name": "public-product-frontend-layer",
            "http": {
                "port": 9000
            },
            "swagger": {
                docPath: __dirname + '/../http/swagger-test/swagger.json',
                swaggerUi: '/swagger.json',
                controllers: __dirname + '/../http/swagger-test',
                useStubs: false
            }
        });

        request('http://localhost:9000/v1/me', function(err, res, body){
            body = JSON.parse(body);

            assert.equal(res.statusCode, 200);
            assert.equal(body.hello, 'world');

            done();
        });
    });

    it('should initialize permissions functionality when present in config', function(done){
        this.timeout = 10000;

        var authEndpoint1 = nock('http://authorization')
            .get('/v1/user/123/hasPermission/test-operation')
            .reply(200);

        var authEndpoint2 = nock('http://authorization')
            .get('/v1/user/123/hasPermission/test-operation-2')
            .reply(404);

        sut.initFromConfig({
            "name": "public-product-frontend-layer",
            "authorization": {
                endpoint: "http://authorization"
            }
        });

        sut.authorizaion.checkPermission('test-operation', 123)
            .then(result => {
                assert.isTrue(authEndpoint1.isDone());
                assert.isTrue(result);

                sut.authorizaion.checkPermission('test-operation-2', 123)
                    .then(result => {
                        assert.isTrue(authEndpoint2.isDone());
                        assert.isFalse(result);

                        return done();
                    })
            })
            .catch(console.error);
    });
});

