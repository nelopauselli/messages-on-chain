var Adapter = require('./adapters/jsonRpcAdapter');
const fs = require('fs'),
    path = require('path');

const url = 'https://rpc-mumbai.maticvigil.com/'; //'http://localhost:7545';
const adapter = new Adapter(url);

async function main() {
    console.log('connecting...');
    let block = await adapter.getBlockNumber();
    console.log(`block: ${block}`);

    let dataPath = path.join(__dirname, '.data');
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

    let accountPath = path.join(dataPath, 'me');
    if (!fs.existsSync(accountPath)) fs.mkdirSync(accountPath);

    let privateKeyPath = path.join(accountPath, 'private.key');
    let account;

    if (!fs.existsSync(privateKeyPath)) {
        account = await adapter.newAccount('me');
        let wallet = account.wallet;
        fs.writeFileSync(privateKeyPath, wallet.privateKey);
        console.log('A new wallet was created');
        console.log(`> Address: ${wallet.address}`);
        console.log(`> Phrase: ${wallet.mnemonic.phrase}`);
    }
    else {
        account = await adapter.createAccount('me');
        let wallet = account.wallet;
        console.log('Wallet was loaded');
        console.log(`> Address: ${wallet.address}`);
    }

    let balance = await account.getBalance();
    console.log(`Your balance is ${balance}`);
}

main();