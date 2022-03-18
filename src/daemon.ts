import { Adapter } from './adapters/jsonRpcAdapter';
import { Configuration } from './configuration';

import { Terminal } from './terminal';

import { Account } from './account';
import { TransactionMessage } from './message';
import { PlainEncoder } from './encoders/plainEncoder';
import { EcEncoder } from './encoders/ecEncoder';

const publicMessageEncoder = new PlainEncoder();
const privateMessageEncoder = new EcEncoder();

export class Daemon {
    adapter: Adapter;
    configuration: Configuration;
    account: Account;
    terminal: Terminal;

    constructor(adapter: Adapter, configuration: Configuration, account: Account, terminal: Terminal) {
        this.adapter = adapter;
        this.configuration = configuration;
        this.account = account;
        this.terminal = terminal;
    }

    async loadMessagesFromBlock(blockNumber: number) {
        let messages = await this.adapter.readMessagesFromBlock([this.configuration.messagesOnChainPublicAddress, this.account.wallet.address], blockNumber);
        if (messages && messages.length) {
            messages.forEach(async (m: TransactionMessage) => {
                if (m.to === this.account.wallet.address) {
                    let text = await privateMessageEncoder.decode(this.account.wallet.privateKey, m.content);
                    this.terminal.log(`${m.from}: ${text}`, 'private', ` - tx: ${m.tx} (${m.block})`);
                } else {
                    let text = publicMessageEncoder.decode(m.content);
                    this.terminal.log(`${m.from}: ${text}`, 'public', ` - tx: ${m.tx} (${m.block})`);
                }
            });
        }
    }

    async run() {
        this.terminal.log(`connecting to ${this.configuration.url}...`, 'debug');
        let currentBlockNumber = await this.adapter.getBlockNumber();

        let balance = await this.account.getBalance();
        this.terminal.log(`Your initial balance is ${balance}`, 'info');

        this.terminal.onSendPublicMessage = async (text) => {
            var content = publicMessageEncoder.encode(text);
            await this.account.send(this.configuration.messagesOnChainPublicAddress, content);
        }

        this.terminal.onSendPrivateMessage = async (address: string, text: string) => {
            let tx = await this.adapter.findAnyTransaction(address);

            if (tx) {
                let publickey = await privateMessageEncoder.getPublicKey(tx);
                let content = await privateMessageEncoder.encode(publickey, text);
                await this.account.send(address, content);
                this.terminal.log('private message sent', 'info');
            }
            else {
                this.terminal.log('Transaction from ' + address + ' not found to get publickey', 'error');
            }
        }

        this.terminal.getBalance = async () => {
            return this.account.getBalance();
        }

        this.terminal.run();

        for (let blockNumber = currentBlockNumber - 2; blockNumber < currentBlockNumber; blockNumber++) {
            this.terminal.log(`Searching message in block ${blockNumber}`, 'info');
            await this.loadMessagesFromBlock(blockNumber);
        }

        this.adapter.onBlock(async (blockNumber: number) => {
            await this.loadMessagesFromBlock(blockNumber);
        });
    }
}