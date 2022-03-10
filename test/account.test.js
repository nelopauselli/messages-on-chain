var assert = require('assert');
const fs = require('fs'),
    path = require("path");

var Adapter = require('./../adapters/jsonRpcAdapter');

const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json')));

describe("Accounts", function () {
    let adapter;

    before(function () {
        adapter = new Adapter(settings.url);
    });

    it("Alice", function () {
        let alice = adapter.createAccount('alice');

        assert(alice);
        assert.equal('alice', alice.name);
        assert(alice.wallet);
        assert.equal("0xCF50b5e4B3AFe99FBfB2d93DCb4BdFE670477505", alice.wallet.address);
    });

    it("Bob", function () {
        let bob = adapter.createAccount('bob');

        assert(bob);
        assert.equal('bob', bob.name);
        assert(bob.wallet);
        assert.equal("0x5c19C5406426783BA02b1cf322F4332b79a8B564", bob.wallet.address);
    });

    it("Batman", function () {
        assert.rejects(() => adapter.createAccount('batman'));
    });

    it("New acount", function () {
        let account = adapter.newAccount();
        assert(account);
        assert(account.wallet);
        assert(account.wallet.address);
        assert(account.wallet.mnemonic);
    });

    it("Balance of Alice", async function () {
        let alice = adapter.createAccount('alice');
        let balance = await alice.getBalance();
        assert(balance);
        assert(balance > 0, 'Balance greater than 0');
    });
})