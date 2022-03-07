var assert = require('assert');

var Adapter = require('./../adapters/jsonRpcAdapter');
var Encoder = require('../encoders/rsaEncoder');

describe("Encoding messages using RSA", function () {
    before(function () {
        adapter = new Adapter('http://localhost:7545');
        encoder = new Encoder();

        alice = adapter.createAccount('alice');
        bob = adapter.createAccount('bob');
    });

    it("Send encrypted message", async function () {
        let buffer = await encoder.encode('bob', 'Hello Bob!');
        let tx = await alice.send(bob.wallet.address, buffer);

        assert(tx);
        assert(tx.hash);
        assert(tx.data);
        assert(tx.to);
        assert(bob.wallet.address, tx.to);
    });

    it("Send and read encrypted message", async function () {
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = await encoder.encode('bob', 'Hello Bob!');
        let tx = await alice.send(bob.wallet.address, buffer);
        await tx.wait();

        let messages = await adapter.readMessages(bob.wallet.address);
        assert(messages);
        assert(1, messages.length);

        let message = messages[0];
        let content = await encoder.decode('bob', message.content);
        assert.equal('Hello Bob!', content);
        assert.equal(lastBlockNumber + 1, message.block);
    });
})