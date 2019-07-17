var assert = require('chai').assert;
var sut = require('../../../src/http');
var fs = require('fs');
var request = require('request');

describe('swagger', function(){
    it('should initialize when enableSwagger is called', function(done){
        this.timeout(10000);

        sut.enableSwagger(require( __dirname + '/swagger-test/swagger.json'), {
            swaggerUi: '/swagger.json',
            controllers: __dirname + '/swagger-test',
            useStubs: false
        });

        const server = sut.listen(10099);

        request('http://localhost:10099/v1/me', function(err, res, body){
            body = JSON.parse(body);

            assert.equal(res.statusCode, 200);
            assert.equal(body.hello, 'world');

            server.close();

            done();
        });
    });
});

