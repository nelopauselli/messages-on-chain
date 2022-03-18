import * as path from 'path';
import { Adapter, JsonRpcAdapter } from './adapters/jsonRpcAdapter';
import { Configuration } from './configuration.js';
import { Terminal } from './terminal';
import { Daemon } from './daemon';
import { Account } from './account';
import { Sender } from './sender';
import { Receiver } from './receiver';

const network = process.argv.length > 2 ? process.argv[2] : "default";
const configuration = Configuration.from(path.join(__dirname, './../settings.json'), network);
const adapter: Adapter = new JsonRpcAdapter(configuration);
const terminal: Terminal = new Terminal();

function loadOrCreateAccount(): Account {
    if (!adapter.existsAccount('me')) {
        let account = adapter.createAccount('me');
        let wallet = account.wallet;
        terminal.log(`\t Address: ${wallet.address}`, 'info');
        terminal.log(`\t Phrase: ${wallet.mnemonic.phrase}`, 'info');
        return account;
    }
    else {
        let account = adapter.loadAccount('me');
        terminal.log(`Your public address is ${account.wallet.address}`, 'info');
        return account;
    }
}

async function start() {
    const account = loadOrCreateAccount();
    const sender = new Sender(adapter, account, configuration, terminal);
    const receiver = new Receiver(adapter, account, configuration, terminal);

    let daemon = new Daemon(adapter, configuration, account, terminal, sender, receiver);
    await daemon.run();
}

start();


