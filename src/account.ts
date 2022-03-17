import { BigNumber, ethers, Wallet } from "ethers";
import fs from 'fs';

export class Account {
    name: string;
    wallet: ethers.Wallet;

    static fromFile(name: string, provider: ethers.providers.Provider): Account {
        let wallet = new ethers.Wallet(fs.readFileSync(`./.data/${name}/private.key`).toString('utf8'), provider);
        return new Account(name, wallet);
    }

    constructor(name: string, wallet: Wallet) {
        this.name = name;
        this.wallet = wallet;
    }

    send(address: string, content: Buffer): Promise<ethers.providers.TransactionResponse> {
        let data = "0x" + content.toString('hex');
        return this.wallet.sendTransaction({
            to: address,
            data: data
        });
    }

    getBalance(): Promise<BigNumber> {
        return this.wallet.getBalance();
    }
}