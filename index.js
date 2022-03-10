var Adapter = require('./adapters/jsonRpcAdapter');
const fs = require('fs'),
    path = require('path');
const terminal = require('./terminal');
const PlainEncoder = require('./encoders/plainEncoder');
const Settings = require('./settings.js');

const network = process.argv.length > 2 ? process.argv[2] : "default";
const settings = Settings.from(path.join(__dirname, 'settings.json'), network);

const publicMessageEncoder = new PlainEncoder();

const adapter = new Adapter(settings.url);

async function loadMessagesFromBlock(blockNumber) {
    let messages = await adapter.readMessages(settings.messagesOnChainPublicAddress, blockNumber);
    if (messages && messages.length) {
        messages.forEach(m => {
            let text = publicMessageEncoder.decode(m.content);
            terminal.log(`${m.from}: ${text}`, 'message', ` - tx: ${m.tx} (${m.block})`);
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
    let account;

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