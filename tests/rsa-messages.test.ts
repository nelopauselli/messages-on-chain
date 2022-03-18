import { ok, equal } from 'assert';
import * as path from 'path';

import { JsonRpcAdapter, Adapter } from './../src/adapters/jsonRpcAdapter';
import { RsaEncoder } from './../src/encoders/rsaEncoder';
import { Account } from './../src/account';
import { Configuration } from './../src/configuration';

describe("Encoding messages using RSA", function () {
    let adapter: Adapter;
    let encoder: RsaEncoder;
    let alice: Account;
    let bob: Account;
    let configuration: Configuration;

    before(function () {
        configuration = Configuration.from(path.join(__dirname, './settings.json'), 'default');
        adapter = new JsonRpcAdapter(configuration);
        encoder = new RsaEncoder(configuration);

        alice = adapter.createAccount('alice');
        bob = adapter.createAccount('bob');
    });

    it("Send encrypted message", async function () {
        let buffer = await encoder.encode('bob', 'Hello Bob!');
        let tx = await alice.send(bob.wallet.address, buffer);

        ok(tx);
        ok(tx.hash);
        ok(tx.data);
        ok(tx.to);
        ok(bob.wallet.address, tx.to);
    });

    it("Send and read encrypted message", async function () {
        let lastBlockNumber = await adapter.getBlockNumber();

        let buffer = await encoder.encode('bob', 'Hello Bob!');
        let tx = await alice.send(bob.wallet.address, buffer);
        await tx.wait();

        let messages = await adapter.readMessages([bob.wallet.address]);
        ok(messages);
        equal(1, messages.length);

        let message = messages[0];
        let content = await encoder.decode('bob', message.content);
        equal('Hello Bob!', content);
        equal(lastBlockNumber + 1, message.block);
    });
})