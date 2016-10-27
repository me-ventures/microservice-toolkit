var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
var sut = require('../../../src/logger');


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

    it('should init with default settings with no config.logger passed', function(done){
        sut.init(undefined);

        assert.typeOf(sut, 'object');

        done();
    });

    afterEach(function() {
        process.stdout.write.restore();
        process.stderr.write.restore();
    });
});
