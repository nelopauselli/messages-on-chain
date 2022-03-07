var assert = require('assert');

var Adapter = require('./../adapters/jsonRpcAdapter');
var Encoder = require('./../encoders/plainEncoder');

describe("Messages", function () {
    before(function () {
        adapter = new Adapter('http://localhost:7545');
        encoder = new Encoder();

        alice = adapter.createAccount('alice');
        messagesOnChainPublicAddress = '0x1111111111111111111111111111111111111111';
    });

    it("Send plain message", async function () {
        let buffer = encoder.encode('Hello crypto world!');
        let tx = await alice.send(messagesOnChainPublicAddress, buffer);

        assert(tx);
        assert(tx.hash);
        assert(tx.data);
        assert.equal('0x48656c6c6f2063727970746f20776f726c6421', tx.data);
    });
})