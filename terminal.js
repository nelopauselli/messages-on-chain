const { ethers } = require("ethers");
var term = require('terminal-kit').terminal;

class Terminal {
    constructor() {
        this.messages = [];
        this.command = "";
        this.blockNumber = NaN;
        this.balance = NaN;
        this.address = undefined;
        this.shutdown = false;
    }

    setBlockNumber(blockNumber) { this.blockNumber = blockNumber; }
    setBalance(balance) { this.balance = balance; }
    setAddress(address) { this.address = address; }

    addMessage(text, level, metadata) {
        if (this.messages.length > process.stdout.rows - 2)
            this.messages.shift();
        this.messages.push({ text, level, metadata });
    }

    run() {
        term.clear();
        term.grabInput();
        term.on('key', (name, matches, data) => {
            // Detect CTRL-C and exit 'manually'
            if (name === 'CTRL_C') {
                this.shutdown = true;
            }
            else if (name === 'BACKSPACE') {
                this.command = this.command.substring(0, this.command.length - 1);
            }
            else if (data.code == '\r') {
                this.onSendPublicMessage(this.command);
                this.command = '';
            }
            else {
                this.command += String.fromCharCode(data.code);
            }
        });

        this.draw();
    }

    draw() {
        term.bgBlack();
        setInterval(() => {
            let firstLine = process.stdout.rows - this.messages.length - 2;
            term.moveTo(1, 1);
            term.gray(`Current block: ${this.blockNumber} | Address: ${this.address} | Balance: ${ethers.utils.formatEther(this.balance)}\n`).eraseLine();

            term.moveTo(1, firstLine);

            let count = 0;
            for (let index = 0; index < this.messages.length; index++) {
                if (this.messages[index].level == 'message') {
                    count++;
                    term.magenta(this.messages[index].text).gray(this.messages[index].metadata + '\n').eraseLine();
                } else {
                    term.gray(this.messages[index].text + '\n').eraseLine();
                }
            }

            term.gray(`\t(${count} messages)\n`);
            term.eraseLine().green(`> ${this.command}`).black();

            if (this.shutdown) {
                term.grabInput(false);
                setTimeout(function () { process.exit() }, 100);
            }
        }, 700)
    }
}

module.exports = new Terminal();