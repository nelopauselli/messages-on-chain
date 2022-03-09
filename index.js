const { ethers } = require("ethers");
var Adapter = require('./adapters/jsonRpcAdapter');
const fs = require('fs'),
    path = require('path');
const terminal = require('./terminal');
const settings = require('./settings');
const PlainEncoder = require('./encoders/plainEncoder');

const publicMessageEncoder = new PlainEncoder();

const adapter = new Adapter(settings.url);

async function main() {
    terminal.addMessage(`connecting to ${settings.url}...`);
    let currentBlockNumber = await adapter.getBlockNumber();
    terminal.addMessage(`Current block: ${currentBlockNumber}`);

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
        terminal.addMessage('A new wallet was created');
        terminal.addMessage(`\t Address: ${wallet.address}`);
        terminal.addMessage(`\t Phrase: ${wallet.mnemonic.phrase}`);
    }
    else {
        account = await adapter.createAccount('me');
        let wallet = account.wallet;
        terminal.addMessage('Wallet was loaded.');
        terminal.addMessage(`\t Address: ${wallet.address}`);
    }

    let balance = await account.getBalance();
    terminal.addMessage(`Your balance is ${ethers.utils.formatEther(balance)}`);

    terminal.onSendPublicMessage = function (text) {
        var content = publicMessageEncoder.encode(text);
        account.send(settings.messagesOnChainPublicAddress, content);
    }

    adapter.on("block", async (blockNumber) => {
        let messages = await adapter.readMessages(settings.messagesOnChainPublicAddress, blockNumber);
        if (messages && messages.length) {
            messages.forEach(m => {
                let text = publicMessageEncoder.decode(m.content);
                terminal.addMessage(`[PUBLIC MESSAGE] ${text}. Block #${m.block}`);
            });
        }
    });

    terminal.run();
}

main();