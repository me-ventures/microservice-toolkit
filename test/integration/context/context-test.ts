var assert = require('chai').assert;
const _context = require('../../../src/context').init({
    "rabbitmq": {
        "host": "localhost"
    }
});

describe("Context Integration test", function(){
    describe("RabbitMQ test", function () {
        it("Should create durable task queue when shared queue is used", function(done){
            var task1Received = 0;

            _context.consumeShared("Test-Exchange", ["none"], "integration-test-none", function(message) {
                // Do some test

                task1Received++;

                return Promise.resolve(message)
            });

            _context.publishToExchange("Test-Exchange", "none", { 'hello': "world" });

            setTimeout(function(){
                assert.equal(task1Received, 1);

                return done()
            }, 1000)

        });

        it("Should distribute messages evenly when multiple consumers", function(done){
            var task1Received = 0;
            var task2Received = 0;

            _context.consumeShared("Test-Exchange2", ["none"], "integration-test-none2", function(message) {
                // Do some test

                task1Received++;

                return Promise.resolve(message)
            });

            _context.consumeShared("Test-Exchange2", ["none"], "integration-test-none2", function(message) {
                // Do some test

                task2Received++;

                return Promise.resolve(message)
            });


            setTimeout(function(){
                _context.publishToExchange("Test-Exchange2", "none", { 'hello': "world" });
                _context.publishToExchange("Test-Exchange2", "none", { 'hello': "world" });
            }, 250);


            setTimeout(function(){
                assert.equal(task1Received, 1);
                assert.equal(task2Received, 1);
                return done()
            }, 1500)

        })
    })
});