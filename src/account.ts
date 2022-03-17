import { ethers, Wallet } from "ethers";
import fs from 'fs';

export class Account {
    name: string;
    wallet: ethers.Wallet;

    static fromFile(name: string, provider: ethers.providers.Provider) {
        let wallet = new ethers.Wallet(fs.readFileSync(`./.data/${name}/private.key`).toString('utf8'), provider);
        return new Account(name, wallet);
    }

    constructor(name: string, wallet: Wallet) {
        this.name = name;
        this.wallet = wallet;
    }

    async send(address:string, content:Buffer) {
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