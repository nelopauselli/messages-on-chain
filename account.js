const { ethers } = require("ethers");
const fs = require('fs');

class Account {
    static fromFile(name, provider) {
        let wallet = new ethers.Wallet(fs.readFileSync(`./.data/${name}/private.key`).toString('utf8'), provider);
        return new Account(name, wallet);
    }

    constructor(name, wallet) {
        this.name = name;
        this.wallet = wallet;
    }

    async send(address, content) {
        let data = "0x" + content.toString('hex');
        const tx = await this.wallet.sendTransaction({
            to: address,
            data: data
        });

        return tx;
    }

    async getBalance() {
        return this.wallet.getBalance();
    }
}

module.exports = Account;