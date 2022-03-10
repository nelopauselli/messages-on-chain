const { ethers } = require("ethers");
const terminal = require('serverline')

class Terminal {
    constructor() {
        this.messages = [];
        this.command = "";
    }

    log(text, level, metadata) {
        if (this.messages.length > process.stdout.rows - 2)
            this.messages.shift();

        let prefix, posfix;
        if (level === 'debug') {
            prefix = '\x1b[2m';
            posfix = '\x1b[0m';
        } else if (level === 'info') {
            prefix = '\x1b[2m';
            posfix = '\x1b[0m';
        } else {
            prefix = '';
            posfix = '';
        }

        this.messages.push({ text: `${prefix}${text}${posfix}`, level, metadata });
    }

    run() {
        process.stdout.write('\x1Bc')

        terminal.init()
        terminal.setCompletion(['help', 'balance', 'clear', 'exit'])

        terminal.setPrompt('\x1b[37m> ')

        terminal.on('line', (line) => {
            switch (line) {
                case 'help':
                    this.help();
                    break
                case 'balance':
                    this.getBalance()
                        .then(balance => console.log(`\x1b[33mYour balance is \x1b[32m${ethers.utils.formatEther(balance)}`));
                    return true;
                case 'clear':
                    process.stdout.write('\x1Bc');
                    return true;
                case 'exit':
                    process.exit(0);
                case '':
                    this.log('Enter the text of your message or type \'help\'');
                    return true;
            }

            terminal.question('public or private? ', (answer) => {
                if (answer === 'public') {
                    this.onSendPublicMessage(line);
                } else if (answer === 'private') {
                    terminal.question('address? ', (address) => {
                        console.log(`I sorry, private message isn't implemented`)
                    })
                } else {
                    console.log(`I don't understand, sorry`)
                }
            });

            if (terminal.isMuted())
                terminal.setMuted(false)
        })

        terminal.on('SIGINT', function (rl) {
            rl.question('Confirm exit: ', (answer) => answer.match(/^y(es)?$/i) ? process.exit(0) : rl.output.write('\x1B[1K> '))
        })

        this.help();

        this.displayFakeLog();
    }

    displayFakeLog() {
        setInterval(() => {
            if (this.messages.length > 0) {
                let message = this.messages.shift();
                console.log(message.text);
            }
        }, 100)
    }

    help() {
        console.log('\x1b[33mcommands:');
        console.log('\x1b[33m\tbalance: get account balance');
        console.log('\x1b[33m\tclear: clear screen');
        console.log('\x1b[33m\texit: close this terminal');
        console.log('');
        console.log('\x1b[33msend a message:');
        console.log('\x1b[33m\ttext of my message');
    }
}

module.exports = new Terminal();