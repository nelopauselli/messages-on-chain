var assert = require('assert');
var Encoder = require('./../encoders/plainEncoder');

describe("Plain encoder", function () {
    let encoder;
    
    before(function () {
        encoder = new Encoder();
    });

    it("Encode", function () {
        let buffer = encoder.encode('Hello crypto world!');
        let expected = Buffer.from("48656c6c6f2063727970746f20776f726c6421", 'hex');
        assert.equal(expected.length, buffer.length);
    });

    it("Decode", function () {
        let buffer = Buffer.from("48656c6c6f2063727970746f20776f726c6421", 'hex');
        let result = encoder.decode(buffer);
        assert.equal('Hello crypto world!', result);
    });
    
    it("Encode and Decode", function () {
        let buffer = encoder.encode('Hello crypto world!');
        let result = encoder.decode(buffer);
        assert.equal('Hello crypto world!', result);
    });
})