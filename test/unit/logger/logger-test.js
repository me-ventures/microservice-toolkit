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

    it('should set unhandled exception handler when initialized with unhandledExceptionHandler set to true', function(done){
        let mochaListener = process.listeners('uncaughtException').pop();

        sut.init({
            unhandledExceptionHandler: true
        });

        let exitStub = sinon.stub(process, 'exit');
        let critSpy = sinon.spy(sut, 'crit');

        process.removeListener('uncaughtException', mochaListener);

        process.emit('uncaughtException', new Error("test-message"));

        setTimeout(() => {
            process.listeners('uncaughtException').push(mochaListener);

            assert.isTrue(exitStub.calledWith(1));
            assert.isTrue(critSpy.calledWith("Unhandled exception: test-message"));

            critSpy.restore();
            exitStub.restore();

            done()
        }, 125)
    });

    it('should set unhandled rejection handler when initialized with enableUnhandledRejectionHandler set to true', function(done){
        sut.init({
            enableUnhandledRejectionHandler: true
        });

        let warnSpy = sinon.spy(sut, 'warning');

        process.emit('unhandledRejection', new Error("test rejection"), Promise.reject());

        setTimeout(() => {
            assert.isTrue(warnSpy.calledWith("Unhandled Rejection at: [object Promise] - reason: Error: test rejection"));

            warnSpy.restore();

            done()
        }, 125)
    });

    it('should not set handlers when initialized without enableUnhandledRejectionHandler and unhandledExceptionHandler set', function(done){
        sut.init(undefined);

        assert.equal(process.listeners('uncaughtException').length, 1);
        assert.equal(process.listeners('unhandledRejection').length, 1);
    });

    afterEach(function() {
        process.stdout.write.restore();
        process.stderr.write.restore();
    });
});
