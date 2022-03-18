import { ok, equal } from 'assert';
import * as path from 'path';

import { JsonRpcAdapter, Adapter } from './../src/adapters/jsonRpcAdapter';
import { PlainEncoder } from './../src/encoders/plainEncoder';
import { Account } from './../src/account';
import { Configuration } from './../src/configuration';

describe("Plain (public) messages", function () {
    let adapter: Adapter;
    let encoder: PlainEncoder;
    let alice: Account;
    let bob: Account;
    let configuration: Configuration;

    before(function () {
        configuration = Configuration.from(path.join(__dirname, './settings.json'), 'default');
        adapter = new JsonRpcAdapter(configuration);
        encoder = new PlainEncoder();

        alice = adapter.createAccount('alice');
        bob = adapter.createAccount('bob');
    });

    it("Send plain message", async function () {
        let buffer = encoder.encode('Hello crypto world!');
        let tx = await alice.send(configuration.messagesOnChainPublicAddress, buffer);

        ok(tx);
        ok(tx.hash);
        ok(tx.data);
        equal('0x48656c6c6f2063727970746f20776f726c6421', tx.data);
    });

    it("Send and read plain message", async function () {
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = encoder.encode('Hello crypto world!');
        let tx = await alice.send(configuration.messagesOnChainPublicAddress, buffer);
        await tx.wait();

        let messages = await adapter.readMessages([configuration.messagesOnChainPublicAddress]);
        ok(messages);
        equal(1, messages.length);

        let message = messages[0];
        equal(lastBlockNumber + 1, message.block);
        ok(message);
        ok(message.block);
        ok(message.content);
        ok(message.from);
        ok(message.tx);
        let content = encoder.decode(message.content);
        equal('Hello crypto world!', content);
    });

    it("Send and find plain message", async function () {
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = encoder.encode('Hello crypto world!');
        let tx1 = await alice.send(configuration.messagesOnChainPublicAddress, buffer);
        await tx1.wait();
        let tx2 = await bob.send(configuration.messagesOnChainPublicAddress, buffer);
        await tx2.wait();

        let tx3 = await adapter.findAnyTransaction(alice.wallet.address);
        ok(tx3);
        equal(alice.wallet.address, tx3.from);
        equal(lastBlockNumber + 1, tx3.blockNumber);
    });
})