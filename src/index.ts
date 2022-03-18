import * as path from 'path';
import { Adapter, JsonRpcAdapter } from './adapters/jsonRpcAdapter';
import { Configuration } from './configuration.js';
import { Terminal } from './terminal';
import { Daemon } from './daemon';
import { Account } from './account';

const network = process.argv.length > 2 ? process.argv[2] : "default";
const configuration = Configuration.from(path.join(__dirname, './../settings.json'), network);
const adapter: Adapter = new JsonRpcAdapter(configuration);
const terminal: Terminal = new Terminal();

async function start() {
    let account: Account;
    if (!adapter.existsAccount('me')) {
        account = await adapter.newAccount('me');
        let wallet = account.wallet;
        terminal.log(`\t Address: ${wallet.address}`, 'info');
        terminal.log(`\t Phrase: ${wallet.mnemonic.phrase}`, 'info');
    }
    else {
        account = await adapter.createAccount('me');
        terminal.log(`Your public address is ${account.wallet.address}`, 'info');
    }

    let daemon = new Daemon(adapter, configuration, account, terminal);
    await daemon.run();
}

start();