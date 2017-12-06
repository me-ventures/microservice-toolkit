const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const sut = require('../../../src/logger');


describe('logger module', function(){
    before(function(){
        sut.init({
            module: 'tester-module'
        });
    });

    beforeEach(function() {
        sinon.spy(process.stdout, 'write');
        sinon.spy(process.stderr, 'write');
    });

    it('should log error strings to console', function(){
        sut.error('this is a test error');

        assert.isTrue(process.stderr.write.calledOnce);
        assert.isTrue(process.stderr.write.calledWithMatch(
            'this is a test error'
        ));
    });

    it('should log error objects with a message property to console', function(){
        sut.error({
            message: 'this is a test error from an object'
        });

        assert.isTrue(process.stderr.write.calledOnce);
        assert.isTrue(process.stderr.write.calledWithMatch(
            'this is a test error from an object'
        ));
    });

    it('should log info strings to console', function(){
        sut.info('this is a info message');

        assert.isTrue(process.stdout.write.calledOnce);
        assert.isTrue(process.stdout.write.calledWithMatch(
            'this is a info message'
        ));
    });

    it('should log info objects with a message property to console', function(){
        sut.info({
            message: 'this is a info message from an object'
        });

        assert.isTrue(process.stdout.write.calledOnce);
        assert.isTrue(process.stdout.write.calledWithMatch(
            'this is a info message from an object'
        ));
    });

    it('should init with default settings with no config.logger passed', function(){
        sut.init(undefined);

        assert.typeOf(sut, 'object');

    });

    it('should set unhandled exception handler when initialized with unhandledExceptionHandler set to true', async function(){
        return new Promise((resolve,reject) => {
            var mochaListener = process.listeners('uncaughtException').pop();

            sut.init({
                unhandledExceptionHandler: true
            });

            var exitStub = sinon.stub(process, 'exit');
            var critSpy = sinon.spy(sut, 'crit');

            process.removeListener('uncaughtException', mochaListener);

            process.emit('uncaughtException', new Error("test-message"));

            setTimeout(() => {
                process.listeners('uncaughtException').push(mochaListener);

                try {
                    assert.isTrue(exitStub.calledWith(1));

                    assert.equal(critSpy.callCount, 2);
                    assert.isTrue(critSpy.calledWith("Unhandled exception: test-message"));

                    const critCall2 = critSpy.getCall(1);
                    assert.isTrue(critCall2.args[0].includes("/test/unit/logger/logger-test.js"));

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
            sut.init({
                enableUnhandledRejectionHandler: true
            });

            const critSpy = sinon.spy(sut, 'crit');

            process.emit('unhandledRejection', new Error("Error: test rejection"));

            setTimeout(() => {
                try {
                    assert.equal(critSpy.callCount, 2);

                    const critCall1 = critSpy.getCall(0);
                    assert.equal(critCall1.args[0], "Unhandled Promise Rejection - reason: [Error: test rejection]");

                    const critCall2 = critSpy.getCall(1);
                    assert.isTrue(critCall2.args[0].includes("/test/unit/logger/logger-test.js"));

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
        sut.init(undefined);

        var mochaListener = process.listeners('unhandledRejection');

        assert.equal(process.listeners('uncaughtException').length, 1);
        assert.equal(process.listeners('unhandledRejection').length, 1);
    });

    afterEach(function() {
        process.stdout.write.restore();
        process.stderr.write.restore();
    });
});
