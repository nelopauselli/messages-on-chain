var assert = require('assert');

var Adapter = require('./../adapters/jsonRpcAdapter');
var Encoder = require('./../encoders/plainEncoder');

describe("Plain (public) messages", function () {
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

    it("Send and read plain message", async function () {
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = encoder.encode('Hello crypto world!');
        let tx = await alice.send(messagesOnChainPublicAddress, buffer);
        await tx.wait();

        let messages = await adapter.readMessages(messagesOnChainPublicAddress);
        assert(messages);
        assert(1, messages.length);

        let message = messages[0];
        let content = encoder.decode(message.content);
        assert.equal('Hello crypto world!', content);
        assert.equal(lastBlockNumber + 1, message.block);
    });
})