const { ethers } = require("ethers");
const Account = require("../account");

class JsonRpcAdapter {
    constructor(url) {
        this.provider = new ethers.providers.JsonRpcProvider(url);
    }

    on(eventName, callback){
        this.provider.on(eventName, callback);
    }

    createAccount(name) {
        return Account.fromFile(name, this.provider);
    }

    newAccount(name) {
        let wallet = ethers.Wallet.createRandom();
        return new Account(name, wallet);
    }

    async getBlockNumber(){
        return await this.provider.getBlockNumber();
    }

    async readMessages(address) {
        let currentBlockNumber = await this.provider.getBlockNumber();
        return this.readMessages(address, currentBlockNumber);
    }

    async readMessages(address, blockNumber) {
        let messages = [];

        let block = await this.provider.getBlock(blockNumber);
        for (let t = 0; t < block.transactions.length; t++) {
            let transactionHash = block.transactions[t];
            let transaction = await this.provider.getTransaction(transactionHash);
            if (transaction.to.toLocaleLowerCase() == address.toLocaleLowerCase()) {
                if (transaction.data) {
                    let raw = transaction.data.slice(2);
                    let message = {
                        block: block.number,
                        content: Buffer.from(raw, 'hex')
                    };

                    messages.push(message);
                }
            }
        }

        return messages;
    }
}

module.exports = JsonRpcAdapter;