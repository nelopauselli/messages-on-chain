const { ethers } = require("ethers");
const Account = require("../account");

class JsonRpcAdapter {
    constructor(url) {
        this.provider = new ethers.providers.JsonRpcProvider(url);
    }

    createAccount(name) {
        return new Account(name, this.provider);
    }

    async getBlockNumber(){
        return await this.provider.getBlockNumber();
    }

    async readMessages(address) {
        let currentBlockNumber = await this.provider.getBlockNumber();

        let messages = [];

        let block = await this.provider.getBlock(currentBlockNumber);
        for (let t = 0; t < block.transactions.length; t++) {
            let transactionHash = block.transactions[t];
            let transaction = await this.provider.getTransaction(transactionHash);
            if (transaction.to == address) {
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