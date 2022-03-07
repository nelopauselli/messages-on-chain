var assert = require('assert');

var Adapter = require('./../adapters/jsonRpcAdapter');

describe("Accounts", function () {
    before(function(){
        adapter = new Adapter('http://localhost:7545');
    });

    it("Alice", function () {
        let alice = adapter.createAccount('alice');

        assert(alice);
        assert.equal('alice', alice.name);
        assert(alice.wallet);
        assert(alice.wallet.publicKey);
    });


})