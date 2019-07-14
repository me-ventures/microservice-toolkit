const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const logger = require('../../../src/logger');
import * as process from "process";


describe('logger module', function(){
    before(function(){
        logger.init({
            module: 'tester-module'
        });
    });

    beforeEach(function() {
        sinon.spy(process.stdout, 'write');
        sinon.spy(process.stderr, 'write');
    });

    it('should log error strings to console', function(){
        logger.error('this is a test error');

        assert.isTrue((process.stderr.write as any).calledOnce);
        assert.isTrue((process.stderr.write as any).calledWithMatch(
            'this is a test error'
        ));
    });

    it('should log error objects with a message property to console', function(){
        logger.error({
            message: 'this is a test error from an object'
        });

        assert.isTrue((process.stderr.write as any).calledOnce);
        assert.isTrue((process.stderr.write as any).calledWithMatch(
            'this is a test error from an object'
        ));
    });

    it('should log info strings to console', function(){
        logger.info('this is a info message');

        assert.isTrue((process.stdout.write as any).calledOnce);
        assert.isTrue((process.stdout.write as any).calledWithMatch(
            'this is a info message'
        ));
    });

    it('should log info objects with a message property to console', function(){
        logger.info({
            message: 'this is a info message from an object'
        });

        assert.isTrue((process.stdout.write as any).calledOnce);
        assert.isTrue((process.stdout.write as any).calledWithMatch(
            'this is a info message from an object'
        ));
    });

    it('should init with default settings with no config.logger passed', function(){
        logger.init(undefined);

        assert.typeOf(logger, 'object');

    });

    it('should set unhandled exception handler when initialized with unhandledExceptionHandler set to true', async function(){
        return new Promise((resolve,reject) => {
            var mochaListener = process.listeners('uncaughtException').pop();

            const sut = logger.init({
                module: "test-module",
                enableUnhandledExceptionHandler: true
            });

            var exitStub = sinon.stub(process, 'exit');

            const winston = require("winston");
            var critSpy = sinon.spy(winston.Logger.prototype, "log");


            process.removeListener('uncaughtException', mochaListener);

            process.emit('uncaughtException', new Error("test-message"));

            setTimeout(() => {
                process.listeners('uncaughtException').push(mochaListener);

                try {
                    assert.isTrue(exitStub.calledWith(1));

                    assert.equal(critSpy.callCount, 2);

                    const call1Args = critSpy.getCall(0).args;
                    assert.equal(call1Args[0], "crit");
                    assert.equal(call1Args[1], "Unhandled exception: test-message");

                    const call2Args = critSpy.getCall(1).args;
                    assert.equal(call2Args[0], "crit");
                    assert.isTrue(call2Args[1].includes("/test/unit/logger/logger-test"));

                    return resolve();
                }

                catch ( err ) {
                    return reject(err);
                }

                finally {
                    critSpy.restore();
                    exitStub.restore();
                }
            }, 125);
        });
    });

    it('should set unhandled rejection handler when initialized with enableUnhandledRejectionHandler set to true', async function(){
        return new Promise((resolve, reject) => {
            logger.init({
                module: "test-module",
                enableUnhandledRejectionHandler: true
            });

            const winston = require("winston");
            var critSpy = sinon.spy(winston.Logger.prototype, "log");

            process.emit('unhandledRejection' as any, new Error("Error: test rejection"));

            setTimeout(() => {
                try {
                    assert.equal(critSpy.callCount, 2);


                    const call1Args = critSpy.getCall(0).args;
                    assert.equal(call1Args[0], "crit");
                    assert.equal(call1Args[1], "Unhandled Promise Rejection - reason: [Error: test rejection]");

                    const call2Args = critSpy.getCall(1).args;
                    assert.equal(call2Args[0], "crit");
                    assert.isTrue(call2Args[1].includes("/test/unit/logger/logger-test"));

                    return resolve();
                }

                catch ( err ) {
                    return reject(err);
                }

                finally {
                    critSpy.restore();
                }

            }, 125)
        });
    });

    it('should not set handlers when initialized without enableUnhandledRejectionHandler and unhandledExceptionHandler set', function(){
        logger.init(undefined);

        var mochaListener = process.listeners('unhandledRejection');

        assert.equal(process.listeners('uncaughtException').length, 1);
        assert.equal(process.listeners('unhandledRejection').length, 1);
    });

    afterEach(function() {
        (process.stdout.write as any).restore();
        (process.stderr.write as any).restore();
    });
});
