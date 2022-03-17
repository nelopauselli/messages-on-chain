import { ethers } from "ethers";
import { TransactionMessage } from "./../message";
import { Account } from './../account';

interface OnBlockCallback<T1, T2 = Promise<void>> {
    (param1: T1): T2;
}

export interface Adapter {
    onBlock(callback: OnBlockCallback<number>): void;
    createAccount(name: string): Account;
    newAccount(name: string): Account;
    getBlockNumber(): Promise<number>;
    readMessages(addresses: string[]): Promise<TransactionMessage[]>;
    readMessagesFromBlock(addresses: string[], blockNumber: number): Promise<TransactionMessage[]>;
    findAnyTransaction(address: string): Promise<ethers.providers.TransactionResponse | null>;
}

export class JsonRpcAdapter implements Adapter {
    provider: ethers.providers.Provider;

    constructor(url: string) {
        this.provider = new ethers.providers.JsonRpcProvider(url);
    }

    onBlock(callback: OnBlockCallback<number>) {
        this.provider.on('block', (blockNumber) => { callback(blockNumber) });
    }

    createAccount(name: string): Account {
        return Account.fromFile(name, this.provider);
    }

    newAccount(name: string): Account {
        let wallet = ethers.Wallet.createRandom();
        let walletConnected = wallet.connect(this.provider);
        return new Account(name, walletConnected);
    }

    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async readMessages(addresses: string[]): Promise<TransactionMessage[]> {
        let currentBlockNumber = await this.provider.getBlockNumber();
        return this.readMessagesFromBlock(addresses, currentBlockNumber);
    }

    async readMessagesFromBlock(addresses: string[], blockNumber: number): Promise<TransactionMessage[]> {
        let messages: TransactionMessage[] = [];
        addresses = addresses.map(a => a.toLowerCase());

        let block = await this.provider.getBlock(blockNumber);
        for (let t = 0; t < block.transactions.length; t++) {
            let transactionHash = block.transactions[t];
            let transaction = await this.provider.getTransaction(transactionHash);
            if (transaction.to && addresses.includes(transaction.to.toLowerCase())) {
                if (transaction.data) {
                    let raw = transaction.data.slice(2);
                    let message = new TransactionMessage(
                        transaction.to,
                        Buffer.from(raw, 'hex'),
                        transaction.from,
                        transaction.hash,
                        block.number);

                    messages.push(message);
                }
            }
        }

        return messages;
    }

    async findAnyTransaction(address: string) {
        let blockNumber = await this.getBlockNumber();
        let limit = Math.min(blockNumber - 100, 0);
        while (blockNumber > limit) {
            let block = await this.provider.getBlock(blockNumber);
            for (let t = 0; t < block.transactions.length; t++) {
                let transactionHash = block.transactions[t];
                let transaction = await this.provider.getTransaction(transactionHash);
                if (transaction.from.toLocaleLowerCase() == address.toLocaleLowerCase()) {
                    return transaction;
                }
            }

            blockNumber--;
        }

        return null;
    }
}