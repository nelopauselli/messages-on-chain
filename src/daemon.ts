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
    currentBlockNumber: number;

    constructor(adapter: Adapter, configuration: Configuration, account: Account, terminal: Terminal, sender: Sender, receiver: Receiver) {
        this.adapter = adapter;
        this.configuration = configuration;
        this.account = account;
        this.terminal = terminal;
        this.sender = sender;
        this.receiver = receiver;
        this.currentBlockNumber = NaN;
    }

    async getBalance() {
        let balance = await this.account.getBalance();
        this.terminal.log(`\x1b[33mYour balance is \x1b[0;32m${utils.formatEther(balance)}`, 'info');
    }

    async getBlockNumber() {
        let block = await this.adapter.getBlockNumber();
        this.terminal.log(`\x1b[33mCurrent block is \x1b[0;32m${block}`, 'info');
    }

    async run() {
        this.terminal.onSendPublicMessage = async (text) => this.sender.sendPublicMessage(text);
        this.terminal.onSendPrivateMessage = async (address: string, text: string) => this.sender.sendPrivateMessage(address, text);
        this.terminal.getBalance = () => this.getBalance();
        this.terminal.getBlockNumber = () => this.getBlockNumber();

        this.terminal.run();

        this.terminal.log(`connecting to ${this.configuration.url}...`, 'debug');
        this.currentBlockNumber = await this.adapter.getBlockNumber() - 1;

        this.getBalance();

        // for (let blockNumber = currentBlockNumber - 2; blockNumber < currentBlockNumber; blockNumber++) {
        //     this.terminal.log(`Searching message in block ${blockNumber}`, 'debug');
        //     await this.receiver.loadMessagesFromBlock(blockNumber);
        // }

        //TODO: Create a contract to listen for events?
        this.adapter.onBlock(async (blockNumber: number) => {
            for (let block = this.currentBlockNumber + 1; block <= blockNumber; block++) {
                this.terminal.log(`Searching message in block ${block}`, 'debug');
                this.currentBlockNumber = block;
                await this.receiver.loadMessagesFromBlock(block);
            }
        });
    }
}