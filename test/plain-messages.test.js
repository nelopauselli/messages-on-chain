var assert = require('assert');
const path = require("path");

var Adapter = require('./../adapters/jsonRpcAdapter');
var Encoder = require('./../encoders/plainEncoder');

const Settings = require('./../settings');
let settings = Settings.from(path.join(__dirname, './settings.json'), 'default');

describe("Plain (public) messages", function () {
    let adapter, encoder;
    let alice;

    before(function () {
        adapter = new Adapter(settings.url);
        encoder = new Encoder();

        alice = adapter.createAccount('alice');
    });

    it("Send plain message", async function () {
        let buffer = encoder.encode('Hello crypto world!');
        let tx = await alice.send(settings.messagesOnChainPublicAddress, buffer);

        assert(tx);
        assert(tx.hash);
        assert(tx.data);
        assert.equal('0x48656c6c6f2063727970746f20776f726c6421', tx.data);
    });

    it("Send and read plain message", async function () {
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = encoder.encode('Hello crypto world!');
        let tx = await alice.send(settings.messagesOnChainPublicAddress, buffer);
        await tx.wait();

        let messages = await adapter.readMessages(settings.messagesOnChainPublicAddress);
        assert(messages);
        assert.equal(1, messages.length);

        let message = messages[0];
        assert.equal(lastBlockNumber + 1, message.block);
        assert(message);
        assert(message.block);
        assert(message.content);
        assert(message.from);
        assert(message.tx);
        let content = encoder.decode(message.content);
        assert.equal('Hello crypto world!', content);
    });
})