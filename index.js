const { ethers } = require("ethers");
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

async function main() {
    terminal.addMessage(`connecting to ${settings.url}...`, 'debug');
    let currentBlockNumber = await adapter.getBlockNumber();
    terminal.addMessage(`Current block: ${currentBlockNumber}`, 'debug');

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
        terminal.addMessage('A new wallet was created', 'info');
        terminal.addMessage(`\t Address: ${wallet.address}`, 'info');
        terminal.addMessage(`\t Phrase: ${wallet.mnemonic.phrase}`, 'info');
    }
    else {
        account = await adapter.createAccount('me');
        let wallet = account.wallet;
        terminal.addMessage('Wallet was loaded.', 'info');
        terminal.addMessage(`\t Address: ${wallet.address}`, 'info');
    }

    let balance = await account.getBalance();
    terminal.addMessage(`Your balance is ${ethers.utils.formatEther(balance)}`, 'debug');

    terminal.onSendPublicMessage = function (text) {
        var content = publicMessageEncoder.encode(text);
        account.send(settings.messagesOnChainPublicAddress, content);
    }

    adapter.on("block", async (blockNumber) => {
        let messages = await adapter.readMessages(settings.messagesOnChainPublicAddress, blockNumber);
        if (messages && messages.length) {
            messages.forEach(m => {
                let text = publicMessageEncoder.decode(m.content);
                terminal.addMessage(`${m.from}: ${text}`, 'message');
            });
        }
    });

    terminal.run();
}

main();