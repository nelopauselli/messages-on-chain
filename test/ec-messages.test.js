const { ethers } = require("ethers");
var assert = require('assert');

var Adapter = require('./../adapters/jsonRpcAdapter');
var Encoder = require('../encoders/ecEncoder');

describe("Encoding messages using EC", function () {
    let publicTx = {
        nonce: 1,
        gasPrice: ethers.BigNumber.from('0x04a817c800'),
        gasLimit: ethers.BigNumber.from('0x52c8'),
        to: '0x1111111111111111111111111111111111111111',
        value: ethers.BigNumber.from('0x00'),
        data: '0x486f6c612043727970746f21',
        chainId: 1337,
        v: 2710,
        r: '0x4670c67044f308de895f65e41b8db4c8e6578251919967ce9324d96eb97fbbf3',
        s: '0x6a05d52ecf6c080f0b33397cd48cc87987f7735285ac59aa3e4f2330dc50eb82',
        from: '0x5c19C5406426783BA02b1cf322F4332b79a8B564',
        hash: '0x6cca0957c46fbf6ba4511e28ab03f7ecade4bb494ba8d49d1b4eb69de6e9e1be',
        type: null,
        confirmations: 0,
    }

    before(function () {
        adapter = new Adapter('http://localhost:7545');
        encoder = new Encoder();

        alice = adapter.createAccount('alice');
        bob = adapter.createAccount('bob');

        assert.equal(publicTx.from, bob.wallet.address);
    });

    it("Send encrypted message", async function () {
        let publicKey = await encoder.getPublicKey(publicTx);
        let buffer = await encoder.encode(publicKey, 'Hello Bob!');
        let tx = await alice.send(bob.wallet.address, buffer);

        assert(tx);
        assert(tx.hash);
        assert(tx.data);
        assert(tx.to);
        assert(bob.wallet.address, tx.to);
    });

    it("Send and read encrypted message", async function () {
        let publicKey = await encoder.getPublicKey(publicTx);
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = await encoder.encode(publicKey, 'Hello Bob!');
        let tx = await alice.send(bob.wallet.address, buffer);
        await tx.wait();

        let messages = await adapter.readMessages(bob.wallet.address);
        assert(messages);
        assert(1, messages.length);

        let message = messages[0];
        let content = await encoder.decode(bob.wallet.privateKey, message.content);
        assert.equal('Hello Bob!', content);
        assert.equal(lastBlockNumber + 1, message.block);
    });
})