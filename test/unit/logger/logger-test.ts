const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const logger = require('../../../src/logger');
import * as process from "process";


describe('logger module', function(){

    describe('error output', function(){
        before(function(){
            logger.init({
                module: 'tester-module'
            });
        });

        beforeEach(function() {
            sinon.spy(process.stdout, 'write');
            sinon.spy(process.stderr, 'write');
        });

        afterEach(function() {
            (process.stdout.write as any).restore();
            (process.stderr.write as any).restore();
        });

        after(function(){
            process.removeAllListeners('uncaughtException');
            process.removeAllListeners('unhandledRejection');
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
    });

    describe('initialisation', function() {
        beforeEach(function () {
            process.removeAllListeners('uncaughtException');
            process.removeAllListeners('unhandledRejection');

            sinon.spy(process.stdout, 'write');
            sinon.spy(process.stderr, 'write');
        });

        afterEach(function() {
            (process.stdout.write as any).restore();
            (process.stderr.write as any).restore();
        });

        it('should init with default settings with no config.logger passed', function(){
            logger.init(undefined);

            assert.typeOf(logger, 'object');

            assert.equal(process.listeners('uncaughtException').length, 1);
            assert.equal(process.listeners('unhandledRejection').length, 1);
        });

        it('should not set handlers when initialized with enableUnhandledRejectionHandler and unhandledExceptionHandler explicitly set to false', function(){
            logger.init({
                enableUnhandledExceptionHandler: false,
                enableUnhandledRejectionHandler: false,
            });

            assert.equal(process.listeners('uncaughtException').length, 0);
            assert.equal(process.listeners('unhandledRejection').length, 0);
        });

        it('should set unhandled exception handler when initialized with unhandledExceptionHandler set to true', async function(){
            return new Promise((resolve,reject) => {
                logger.init({
                    module: "test-module",
                    enableUnhandledExceptionHandler: true,
                    enableUnhandledRejectionHandler: false,
                });

                var exitStub = sinon.stub(process, 'exit');

                const winston = require("winston");
                var critSpy = sinon.spy(winston.Logger.prototype, "log");

                process.emit('uncaughtException', new Error("test-message"));

                setTimeout(() => {
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
                    enableUnhandledRejectionHandler: true,
                    enableUnhandledExceptionHandler: false,
                });

                const exitStub = sinon.stub(process, 'exit');

                const winston = require("winston");
                const critSpy = sinon.spy(winston.Logger.prototype, "log");

                process.emit('unhandledRejection' as any, new Error("Error: test rejection"));

                setTimeout(() => {
                    try {
                        assert.isTrue(exitStub.calledWith(1));

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
                        exitStub.restore();
                    }

                }, 125)
            });
        });
    });
});
