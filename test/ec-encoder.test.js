const { ethers } = require("ethers");

var assert = require('assert');
var Adapter = require('../adapters/jsonRpcAdapter');
var Encoder = require('../encoders/ecEncoder');
var PlainEncoder = require('../encoders/plainEncoder');

describe("EC encoder", function () {
    let tx = {
        nonce: 149,
        gasPrice:  ethers.BigNumber.from('0x04a817c800'),
        gasLimit: ethers.BigNumber.from('0x5338'),
        to: '0x1111111111111111111111111111111111111111',
        value: ethers.BigNumber.from('0x00'),
        data: '0x48656c6c6f2063727970746f20776f726c6421',
        chainId: 1337,
        v: 2710,
        r: '0xe72ed4a2a9fe73319667519f392865aa57506fbf06413e6e5277ca89df4eb36e',
        s: '0x175e8a99b71beabe407fbe68c901227d2a5638c45bc0f32ef7dc6ba9bca35b14',
        from: '0xCF50b5e4B3AFe99FBfB2d93DCb4BdFE670477505',
        hash: '0xd7adf8bae6a28e3c188539c55387a4114032a9a802b68ae50074b4b4d1a5f87b',
        type: null,
        confirmations: 0            
      };

    before(function () {
        adapter = new Adapter('http://localhost:7545');
        alice = adapter.createAccount('alice');
        bob = adapter.createAccount('bob');

        encoder = new Encoder();
        plainEncoder = new PlainEncoder();

        messagesOnChainPublicAddress = '0x1111111111111111111111111111111111111111';
    });

    it("Get public key from tx", async function () {
        let publicKey = await encoder.getPublicKey(tx);

        assert(alice.wallet.publicKey);
        assert(publicKey);
        assert.equal(publicKey, alice.wallet.publicKey);
    });

    it("Encode and Decode", async function () {
        let publicKey = await encoder.getPublicKey(tx);

        let buffer = await encoder.encode(publicKey, 'Hello Alice!');
        let result = await encoder.decode(alice.wallet.privateKey, buffer);
        assert.equal('Hello Alice!', result);
    });

})