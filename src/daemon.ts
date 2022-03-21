import { utils } from "ethers";
import { Adapter } from './adapters/jsonRpcAdapter';
import { Configuration } from './configuration';

import { Terminal } from './terminal';

import { Account } from './account';
import { Sender } from "./sender";
import { Receiver } from "./receiver";

export class Daemon {
    adapter: Adapter;
    configuration: Configuration;
    account: Account;
    terminal: Terminal;
    sender: Sender;
    receiver: Receiver;

    constructor(adapter: Adapter, configuration: Configuration, account: Account, terminal: Terminal, sender: Sender, receiver: Receiver) {
        this.adapter = adapter;
        this.configuration = configuration;
        this.account = account;
        this.terminal = terminal;
        this.sender = sender;
        this.receiver = receiver;
    }

    async getBalance() {
        let balance = await this.account.getBalance();
        this.terminal.log(`\x1b[33mYour balance is \x1b[0;32m${utils.formatEther(balance)}`, 'info');
    }

    async run() {
        this.terminal.log(`connecting to ${this.configuration.url}...`, 'debug');
        let currentBlockNumber = await this.adapter.getBlockNumber();

        this.getBalance();

        this.terminal.onSendPublicMessage = async (text) => this.sender.sendPublicMessage(text);
        this.terminal.onSendPrivateMessage = async (address: string, text: string) => this.sender.sendPrivateMessage(address, text);
        this.terminal.getBalance = () => this.getBalance();

        this.terminal.run();

        for (let blockNumber = currentBlockNumber - 2; blockNumber < currentBlockNumber; blockNumber++) {
            this.terminal.log(`Searching message in block ${blockNumber}`, 'debug');
            await this.receiver.loadMessagesFromBlock(blockNumber);
        }

        this.adapter.onBlock(async (blockNumber: number) => {
            this.terminal.log(`Searching message in block ${blockNumber}`, 'debug');
            await this.receiver.loadMessagesFromBlock(blockNumber);
        });
    }
}