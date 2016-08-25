var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');

var request = require('request');


describe('routes', function(){
    beforeEach(function(){
        this.sandbox = sinon.sandbox.create();
        this.sandbox.sut = require('../../../src/status');
        this.sandbox.provider = require('../../../src/status/provider');
    });

    afterEach(function(){
        this.sandbox.sut.shutdown();
        this.sandbox.provider.reset();
        this.sandbox.restore();
    });

    describe('endpoint /', function(){
        it('should init correctly (return 200 on default port)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service-1'
                }
            });

            request.get('http://localhost:11111/status', function(err, res){
                assert.equal(res.statusCode, 200);

                done();
            });
        });

        it('should init correctly (return 200 on port 12345)', function(done){
            this.sandbox.sut.init({
                port: 12345,
                service: {
                    name: 'test-service-1'
                }
            });

            request.get('http://localhost:12345/status', function(err, res){
                assert.equal(res.statusCode, 200);

                done();
            });
        });

        it('should show service information', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.setServiceInformation('test-service-3');

            request.get('http://localhost:11111/status', function(err, res, body){
                assert.equal(res.statusCode, 200);

                body = JSON.parse(body);

                assert.deepEqual(body, {
                    service: {
                        name: 'test-service-3'
                    },
                    events: {
                        consume: [],
                        publish: []
                    }
                });

                done();
            });
        });

        it('should show added events', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventConsume(
                'test-ns-1',
                'test-event-1',
                true,
                'test-queue-name.test-event1'
            );
            this.sandbox.provider.addEventPublish(
                'test-ns-2',
                'test-event-2'
            );

            request.get('http://localhost:11111/status', function(err, res, body){
                assert.equal(res.statusCode, 200);

                body = JSON.parse(body);

                assert.deepEqual(body, {
                    service: {
                        name: 'test-service'
                    },
                    events: {
                        consume: [
                            {
                                namespace: 'test-ns-1',
                                topic: 'test-event-1',
                                shared: true,
                                queueName: 'test-queue-name.test-event1',
                                schema: ''
                            }
                        ],
                        publish: [
                            {
                                namespace: 'test-ns-2',
                                topic: 'test-event-2',
                                schema: ''
                            }
                        ]
                    }
                });

                done();
            });
        });

        it('should not add same namespace/topic publish event more than once', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });

            for( var i = 0; i < 10; i++ ){
                this.sandbox.provider.addEventPublish(
                    'test-ns-2',
                    'test-event-2'
                );
            }

            request.get('http://localhost:11111/status', function(err, res, body){
                assert.equal(res.statusCode, 200);

                body = JSON.parse(body);

                assert.deepEqual(body, {
                    service: {
                        name: 'test-service'
                    },
                    events: {
                        consume: [],
                        publish: [
                            {
                                namespace: 'test-ns-2',
                                topic: 'test-event-2',
                                schema: ''
                            }
                        ]
                    }
                });

                done();
            });
        });
    });
});
