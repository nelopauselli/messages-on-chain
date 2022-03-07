const { ethers } = require("ethers");
const fs = require('fs');

class Account {
    constructor(name, provider) {
        this.name = name;
        this.wallet = new ethers.Wallet(fs.readFileSync(`./.data/${name}/private.key`).toString('utf8'), provider);
    }

    async send(address, content){
        let data = "0x" + content.toString('hex');
        const tx = await this.wallet.sendTransaction({
            to: address,
            data: data
        });
        
        return tx;
    }
}

module.exports = Account;