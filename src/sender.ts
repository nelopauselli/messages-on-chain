import { Account } from "./account";
import { Adapter } from "./adapters/jsonRpcAdapter";

import { PlainEncoder } from './encoders/plainEncoder';
import { EcEncoder } from './encoders/ecEncoder';
import { Configuration } from "./configuration";
import { Terminal } from "./terminal";

const publicMessageEncoder = new PlainEncoder();
const privateMessageEncoder = new EcEncoder();

export class Sender {
    adapter: Adapter;
    account: Account;
    configuration: Configuration;
    terminal: Terminal;

    constructor(adapter: Adapter, account: Account, configuration: Configuration, terminal: Terminal) {
        this.adapter = adapter;
        this.account = account;
        this.configuration = configuration;
        this.terminal = terminal;
    }

    async sendPublicMessage(text: string) {
        var content = publicMessageEncoder.encode(text);
        await this.account.send(this.configuration.messagesOnChainPublicAddress, content);
    }

    async sendPrivateMessage(address: string, text: string): Promise<void> {
        let tx = await this.adapter.findAnyTransaction(address);

        if (!tx) {
            this.terminal.log('Transaction from ' + address + ' not found to get publickey', 'error');
            return;
        }

        let publickey = await privateMessageEncoder.getPublicKey(tx);
        let content = await privateMessageEncoder.encode(publickey, text);
        await this.account.send(address, content);
        this.terminal.log('Message sent', 'info');
    }
}

