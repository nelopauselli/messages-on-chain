import {ok, equal, rejects} from 'assert';
import { BigNumber } from 'ethers';
import * as path from 'path';

import { JsonRpcAdapter, Adapter } from './../src/adapters/jsonRpcAdapter';
import { Configuration } from './../src/configuration';

describe("Accounts", function () {
    let adapter: Adapter;
    let configuration: Configuration;

    before(function () {
        configuration = Configuration.from(path.join(__dirname, './settings.json'), 'default');
        adapter = new JsonRpcAdapter(configuration);
    });

    it("Alice exists", function () {
        let exists = adapter.existsAccount('alice');
        ok(exists);
    });

    it("Alice", function () {
        let alice = adapter.loadAccount('alice');

        ok(alice);
        equal('alice', alice.name);
        ok(alice.wallet);
        equal("0xCF50b5e4B3AFe99FBfB2d93DCb4BdFE670477505", alice.wallet.address);
    });

    it("Bob exists", function () {
        let exists = adapter.existsAccount('bob');
        ok(exists);
    });

    it("Bob", function () {
        let bob = adapter.loadAccount('bob');

        ok(bob);
        equal('bob', bob.name);
        ok(bob.wallet);
        equal("0x5c19C5406426783BA02b1cf322F4332b79a8B564", bob.wallet.address);
    });

    it("Batman don't exists", function () {
        let exists = adapter.existsAccount('batman');
        ok(!exists);
    });

    it("Batman", function () {
        rejects(async () => adapter.loadAccount('batman'));
    });

    it("New acount", async function () {
        let account = adapter.createAccount('peter');
        ok(account);
        ok(account.wallet);
        ok(account.wallet.address);
        ok(account.wallet.mnemonic);

        let balance = await account.getBalance();
        equal(0, balance);
    });

    it("Balance of Alice", async function () {
        let alice = adapter.loadAccount('alice');
        let balance = await alice.getBalance();
        ok(balance);
        ok(balance > BigNumber.from(0), 'Balance greater than 0');
    });
})