var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');

var request = require('request');


describe('routes', function(){
    beforeEach(function(){
        this.sandbox = sinon.sandbox.create();
        this.sandbox.sut = require('../../../src/status');
    });

    afterEach(function(){
        this.sandbox.restore();
    });

    describe('endpoint /', function(){
        it('should init correctly (return 200 on default port)', function(done){
            this.sandbox.sut.init();

            request.get('http://localhost:11111/status', function(err, res){
                assert.equal(res.statusCode, 200);

                done();
            });
        });

        it('should init correctly (return 200 on port 12345)', function(done){
            this.sandbox.sut.init({
                port: 12345
            });

            request.get('http://localhost:12345/status', function(err, res){
                assert.equal(res.statusCode, 200);

                done();
            });
        });
    });
});
