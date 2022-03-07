const { ethers } = require("ethers");
const fs = require('fs');

class Account {
    constructor(name, provider) {
        this.name = name;
        this.wallet = new ethers.Wallet(fs.readFileSync(`./.data/${name}/private.key`), provider);
    }
}

module.exports = Account;