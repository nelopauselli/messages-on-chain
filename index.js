var Adapter = require('./adapters/jsonRpcAdapter');
const fs = require('fs'),
    path = require('path');
const terminal = require('./terminal');
const PlainEncoder = require('./encoders/plainEncoder');
const EcEncoder = require('./encoders/ecEncoder');
const Settings = require('./settings.js');

const network = process.argv.length > 2 ? process.argv[2] : "default";
const settings = Settings.from(path.join(__dirname, 'settings.json'), network);

const publicMessageEncoder = new PlainEncoder();
const privateMessageEncoder = new EcEncoder();

const adapter = new Adapter(settings.url);
let account;

async function loadMessagesFromBlock(blockNumber) {
    let messages = await adapter.readMessages(settings.messagesOnChainPublicAddress, blockNumber);
    if (messages && messages.length) {
        messages.forEach(m => {
            let text = publicMessageEncoder.decode(m.content);
            terminal.log(`${m.from}: ${text}`, 'public', ` - tx: ${m.tx} (${m.block})`);
        });
    }

    let messages2 = await adapter.readMessages(account.wallet.address, blockNumber);
    if (messages2 && messages2.length) {
        messages2.forEach(async m => {
            let text = await privateMessageEncoder.decode(account.wallet.privateKey, m.content);
            terminal.log(`${m.from}: ${text}`, 'private', ` - tx: ${m.tx} (${m.block})`);
        });
    }
}

async function main() {
    terminal.log(`connecting to ${settings.url}...`, 'debug');
    let currentBlockNumber = await adapter.getBlockNumber();

    let dataPath = path.join(__dirname, '.data');
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

    let accountPath = path.join(dataPath, 'me');
    if (!fs.existsSync(accountPath)) fs.mkdirSync(accountPath);

    let privateKeyPath = path.join(accountPath, 'private.key');

    if (!fs.existsSync(privateKeyPath)) {
        account = await adapter.newAccount('me');
        let wallet = account.wallet;
        fs.writeFileSync(privateKeyPath, wallet.privateKey);
        terminal.log(`\t Address: ${wallet.address}`, 'info');
        terminal.log(`\t Phrase: ${wallet.mnemonic.phrase}`, 'info');
    }
    else {
        account = await adapter.createAccount('me');
        terminal.log(`Your public address is ${account.wallet.address}`, 'info');
    }

    let balance = await account.getBalance();
    terminal.log(`Your initial balance is ${balance}`, 'info');

    terminal.onSendPublicMessage = function (text) {
        var content = publicMessageEncoder.encode(text);
        account.send(settings.messagesOnChainPublicAddress, content);
    }

    terminal.onSendPrivateMessage = async (address, text) => {
        let tx = await adapter.findAnyTransaction(address);

        if (tx) {
            let publickey = await privateMessageEncoder.getPublicKey(tx);
            let content = await privateMessageEncoder.encode(publickey, text);
            await account.send(address, content);
            terminal.log('private message sent', 'info');
        }
        else {
            terminal.log('Transaction from ' + address + ' not found to get publickey')
        }
    }

    terminal.getBalance = function () {
        return account.getBalance();
    }

    terminal.run();

    for (let blockNumber = currentBlockNumber - 2; blockNumber < currentBlockNumber; blockNumber++) {
        terminal.log(`Searching message in block ${blockNumber}`, 'info');
        await loadMessagesFromBlock(blockNumber);
    }

    adapter.on("block", async (blockNumber) => {
        await loadMessagesFromBlock(blockNumber);
    });
}

main();