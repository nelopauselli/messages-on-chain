var assert = require('assert');
var Encoder = require('../encoders/rsaEncoder');

describe("Rsa encoder", function () {
    before(function () {
        encoder = new Encoder();
    });

    it("Encode", async function () {
        let buffer = await encoder.encode('bob', 'Hello crypto world!');
        let plainEncode = Buffer.from("48656c6c6f2063727970746f20776f726c6421", 'hex');
        assert(buffer);
        assert.notEqual(plainEncode.length, buffer.length);
    });

    it("Encode and Decode", async function () {
        let buffer = await encoder.encode('bob', 'Hello crypto world!');
        let result = await encoder.decode('bob', buffer);
        assert.equal('Hello crypto world!', result);
    });

    it("Decode using other account", async function () {
        let buffer = await encoder.encode('bob', 'Hello crypto world!');
        assert.rejects(async () => await encoder.decode('alice', buffer));
    });
})