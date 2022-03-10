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

    addMessage(text, level) {
        if (this.messages.length > process.stdout.rows - 2)
            this.messages.shift();
        this.messages.push({ text, level });
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
            term.moveTo(1, firstLine);

            for (let index = 0; index < this.messages.length; index++) {
                if (this.messages[index].level == 'message') {
                    term.magenta(this.messages[index].text + '\n').eraseLine();
                } else {
                    term.gray(this.messages[index].text + '\n').eraseLine();
                }
            }

            term.gray(`\t(${this.messages.length} messages)\n`);
            term.eraseLine().green(`> ${this.command}`).black();

            if (this.shutdown) {
                term.grabInput(false);
                setTimeout(function () { process.exit() }, 100);
            }
        }, 700)
    }
}

module.exports = new Terminal();