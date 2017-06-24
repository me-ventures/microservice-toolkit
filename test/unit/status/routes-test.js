var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');

var request = require('request');


describe('routes', function(){
    beforeEach(function(){
        this.sandbox = sinon.sandbox.create();
        this.sandbox.sut = require('../../../src/status/index');
        this.sandbox.provider = require('../../../src/status/provider/index');
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

        it('should add examples for present events once (publish)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventPublish(
                'test-ns-2',
                'test-event-2'
            );

            for( var i = 0; i < 10; i ++ ){
                this.sandbox.provider.setEventPublishExample(
                    'test-ns-2',
                    'test-event-2',
                    {
                        hello: 'world',
                        this_is: {
                            some: 'data ' + i
                        }
                    }
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
                                schema: '',
                                example: {
                                    hello: 'world',
                                    this_is: {
                                        some: 'data 0'
                                    }
                                }
                            }
                        ]
                    }
                });

                done();
            });
        });

        it('should add examples for present events once, and not break with post-set circular reference introduction (publish)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventPublish(
                'test-ns-2',
                'test-event-2'
            );

            let exampleEvent = {
                hello: 'world',
                this_is: {
                    some: 'data'
                }
            };

            for( var i = 0; i < 10; i ++ ){
                exampleEvent.this_is.some = 'data ' + i;

                this.sandbox.provider.setEventPublishExample(
                    'test-ns-2',
                    'test-event-2',
                    exampleEvent
                );
            }

            // circular reference added after example event is set
            let circularRefObject = {
                circular: exampleEvent
            };

            exampleEvent.circular = circularRefObject;



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
                                schema: '',
                                example: {
                                    hello: 'world',
                                    this_is: {
                                        some: 'data 0'
                                    }
                                }
                            }
                        ]
                    }
                });

                done();
            });
        });

        it('should throw error for not present events (publish)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventPublish(
                'test-ns-2',
                'test-event-2'
            );

            var self = this;
            var fn = function(){
                self.sandbox.provider.setEventPublishExample(
                    'test-ns-2123123213',
                    'test-event-2',
                    {
                        hello: 'world',
                        this_is: {
                            some: 'data'
                        }
                    }
                );
            };

            assert.throws(
                fn,
                Error,
                "unknown key: test-ns-2123123213test-event-2"
            );

            done();
        });

        it('should add examples for present events (consume)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventConsume(
                'test-ns-2',
                'test-event-2'
            );

            this.sandbox.provider.setEventConsumeExample(
                'test-ns-2',
                'test-event-2',
                {
                    hello: 'world',
                    this_is: {
                        some: 'consume data'
                    }
                }
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
                                namespace: 'test-ns-2',
                                topic: 'test-event-2',
                                schema: '',
                                queueName: '',
                                shared: false,
                                example: {
                                    hello: 'world',
                                    this_is: {
                                        some: 'consume data'
                                    }
                                }
                            }
                        ],
                        publish: []
                    }
                });

                done();
            });
        });

        it('should not error if a circular reference is introduced into examples for present events (consume)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventConsume(
                'test-ns-2',
                'test-event-2'
            );

            let exampleEvent = {
                hello: 'world',
                this_is: {
                    some: 'consume data'
                }
            };

            this.sandbox.provider.setEventConsumeExample(
                'test-ns-2',
                'test-event-2',
                exampleEvent
            );

            // circular reference added after example event is set
            let circularRefObject = {
                circular: exampleEvent
            };

            exampleEvent.circular = circularRefObject;


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
                                namespace: 'test-ns-2',
                                topic: 'test-event-2',
                                schema: '',
                                queueName: '',
                                shared: false,
                                example: {
                                    hello: 'world',
                                    this_is: {
                                        some: 'consume data'
                                    }
                                }
                            }
                        ],
                        publish: []
                    }
                });

                done();
            });
        });

        it('should throw error for not present events (consume)', function(done){
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            });
            this.sandbox.provider.addEventConsume(
                'test-ns-2',
                'test-event-2'
            );

            var self = this;
            var fn = function(){
                self.sandbox.provider.setEventConsumeExample(
                    'test-ns-2123123213',
                    'test-event-2',
                    {
                        hello: 'world',
                        this_is: {
                            some: 'data'
                        }
                    }
                );
            };

            assert.throws(
                fn,
                Error,
                "unknown key: test-ns-2123123213test-event-2"
            );

            done();
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

        it('should detect unique config values that start with http:// or https:// and add them to httpEndpoints property', function(done) {
            this.sandbox.sut.init({
                service: {
                    name: 'test-service'
                }
            }, {
                some: {
                    stuff: 'here',
                    blah: 'http://endpoint/blah/v3'
                },
                endpoints: [
                    'https://endpoint2',
                    'https://endpoint2',
                    'https://endpoint2',
                    'http://endpoint3',
                    {
                        something: {
                            notHttp: 'httX://boo',
                            deeper: 'http://endpoint4',
                        }
                    }
                ],
                thing: {
                    endpoint5: 'https://endpoint5/api/v5/blah'
                }
            });

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
                    httpEndpoints: [
                        'http://endpoint/blah/v3',
                        'https://endpoint2',
                        'http://endpoint3',
                        'http://endpoint4',
                        'https://endpoint5/api/v5/blah'
                    ],
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
