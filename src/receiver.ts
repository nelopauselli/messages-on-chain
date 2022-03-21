import { Account } from "./account";
import { Adapter } from "./adapters/jsonRpcAdapter";

import { PlainEncoder } from './encoders/plainEncoder';
import { EcEncoder } from './encoders/ecEncoder';
import { TransactionMessage } from './message';
import { Configuration } from "./configuration";
import { Logger } from "./terminal";

const publicMessageEncoder = new PlainEncoder();
const privateMessageEncoder = new EcEncoder();

export class Receiver {
    adapter: Adapter;
    account: Account;
    configuration: Configuration;
    logger: Logger;

    constructor(adapter: Adapter, account: Account, configuration: Configuration, logger: Logger) {
        this.adapter = adapter;
        this.account = account;
        this.configuration = configuration;
        this.logger = logger;
    }

    async loadMessagesFromBlock(blockNumber: number) {
        let transactions = await this.adapter.readMessagesFromBlock([this.configuration.messagesOnChainPublicAddress, this.account.wallet.address], blockNumber);
        if (transactions.length > 0) {
            transactions.forEach(async (m: TransactionMessage) => {
                await this.loadMessageFromTransaction(m);
            });
        } else {
            this.logger.log(`No message found in block ${blockNumber}`, 'debug');
        }
    }

    async loadMessageFromTransaction(m: TransactionMessage) {
        if (m.to === this.account.wallet.address) {
            let text = await privateMessageEncoder.decode(this.account.wallet.privateKey, m.content);
            this.logger.log(`${m.from}: ${text}`, 'private', ` - tx: ${m.tx} (${m.block})`);
        } else {
            let text = publicMessageEncoder.decode(m.content);
            this.logger.log(`${m.from}: ${text}`, 'public', ` - tx: ${m.tx} (${m.block})`);
        }
    }
}
