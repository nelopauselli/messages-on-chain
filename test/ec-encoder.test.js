var assert = require('assert');
var Adapter = require('../adapters/jsonRpcAdapter');
var Encoder = require('../encoders/ecEncoder');
var PlainEncoder = require('../encoders/plainEncoder');

describe("EC encoder", function () {
    before(function () {
        adapter = new Adapter('http://localhost:7545');
        alice = adapter.createAccount('alice');

        encoder = new Encoder();
        plainEncoder = new PlainEncoder();

        messagesOnChainPublicAddress = '0x1111111111111111111111111111111111111111';
    });

    it("Get public key from tx", async function () {
        let buffer = plainEncoder.encode('Hello crypto world!');
        let tx = await alice.send(messagesOnChainPublicAddress, buffer);

        let publicKey = await encoder.getPublicKey(tx);

        assert(alice.wallet.publicKey);
        assert(publicKey);
        assert.equal(publicKey, alice.wallet.publicKey);
    });
})