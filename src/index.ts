import { Adapter, JsonRpcAdapter } from './adapters/jsonRpcAdapter';
import path from 'path';

import { Account } from './account';
import { TransactionMessage } from './message';

import { Terminal } from './terminal';

const terminal: Terminal = new Terminal();

import { PlainEncoder } from './encoders/plainEncoder';
import { EcEncoder } from './encoders/ecEncoder';
import { Configuration } from './configuration.js';

const network = process.argv.length > 2 ? process.argv[2] : "default";
const configuration = Configuration.from(path.join(__dirname, './../settings.json'), network);

const publicMessageEncoder = new PlainEncoder();
const privateMessageEncoder = new EcEncoder();

const adapter: Adapter = new JsonRpcAdapter(configuration);
let account: Account;

async function loadMessagesFromBlock(blockNumber: number) {
    let messages = await adapter.readMessagesFromBlock([configuration.messagesOnChainPublicAddress, account.wallet.address], blockNumber);
    if (messages && messages.length) {
        messages.forEach(async (m: TransactionMessage) => {
            if (m.to === account.wallet.address) {
                let text = await privateMessageEncoder.decode(account.wallet.privateKey, m.content);
                terminal.log(`${m.from}: ${text}`, 'private', ` - tx: ${m.tx} (${m.block})`);
            } else {
                let text = publicMessageEncoder.decode(m.content);
                terminal.log(`${m.from}: ${text}`, 'public', ` - tx: ${m.tx} (${m.block})`);
            }
        });
    }
}

async function main() {
    terminal.log(`connecting to ${configuration.url}...`, 'debug');
    let currentBlockNumber = await adapter.getBlockNumber();

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

    let balance = await account.getBalance();
    terminal.log(`Your initial balance is ${balance}`, 'info');

    terminal.onSendPublicMessage = async (text) => {
        var content = publicMessageEncoder.encode(text);
        account.send(configuration.messagesOnChainPublicAddress, content);
    }

    terminal.onSendPrivateMessage = async (address, text) => {
        let tx = await adapter.findAnyTransaction(address);

        if (tx) {
            let publickey = await privateMessageEncoder.getPublicKey(tx);
            let content = await privateMessageEncoder.encode(publickey, text);
            await account.send(address, content);
            terminal.log('private message sent', 'info');
        }
        else {
            terminal.log('Transaction from ' + address + ' not found to get publickey', 'error');
        }
    }

    terminal.getBalance = function () {
        return account.getBalance();
    }

    terminal.run();

    for (let blockNumber = currentBlockNumber - 2; blockNumber < currentBlockNumber; blockNumber++) {
        terminal.log(`Searching message in block ${blockNumber}`, 'info');
        await loadMessagesFromBlock(blockNumber);
    }

    adapter.onBlock(async (blockNumber: number) => {
        await loadMessagesFromBlock(blockNumber);
    });
}

main();