var term = require('terminal-kit').terminal;

class Terminal {
    constructor() {
        this.messages = [];
        this.command = "";
        this.shutdown = false;
    }

    setBlockNumber(blockNumber) {
        this.addMessage(`Current block is ${blockNumber}`);
    }

    addMessage(text) {
        if (this.messages.length > process.stdout.rows - 2)
            this.messages.shift();
        this.messages.push(text);
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
        setInterval(() => {
            let firstLine = process.stdout.rows - this.messages.length - 2;
            term.moveTo(1, firstLine).green.bgBlack();

            for (let index = 0; index < this.messages.length; index++)
                term(this.messages[index] + '\n').eraseLine();

            term.gray(`\t(${this.messages.length} messages)\n`);
            term.eraseLine().blue(`> ${this.command}`).black.bgBlack();

            if (this.shutdown) {
                term.grabInput(false);
                setTimeout(function () { process.exit() }, 100);
            }
        }, 700)
    }
}

module.exports = new Terminal();