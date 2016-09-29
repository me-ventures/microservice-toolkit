var assert = require('chai').assert;
var sinon = require('sinon');
var sut = require('../../../src/logger');
var nock = require('nock');

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

    it('should log errors to console', function(){
        sut.error('this is a test');
        sut.info('this is a info message');

        assert.isTrue(process.stderr.write.calledOnce);
        assert.isTrue(process.stdout.write.calledOnce);
    });

    afterEach(function() {
        process.stdout.write.restore();
        process.stderr.write.restore();
    });
});