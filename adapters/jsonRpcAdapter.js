const { ethers } = require("ethers");
const Account = require("../account");

class JsonRpcAdapter {
    constructor(url) {
        this.provider = new ethers.providers.JsonRpcProvider(url);
    }

    createAccount(name) {
        return new Account(name, this.provider);
    }
}

module.exports = JsonRpcAdapter;