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
        this.messages.push({ text, level, metadata });
    }

    run() {
        process.stdout.write('\x1Bc')

        terminal.init()
        terminal.setCompletion(['help', 'balance', 'check', 'ping'])

        terminal.setPrompt('> ')

        terminal.on('line', (line) => {
            console.log('cmd:', line)
            switch (line) {
                case 'help':
                    console.log('help: To get this message.')
                    break
                case 'pwd':
                    console.log('toggle muted', !terminal.isMuted())
                    terminal.setMuted(!terminal.isMuted(), '> [hidden]')
                    return true
                case 'balance':
                    this.getBalance()
                        .then(balance => console.log(`Your balance is ${ethers.utils.formatEther(balance)}`));
                    return true
                default:
                    terminal.question('public or private? ', (answer) => {
                        if (answer === 'public') {
                            this.onSendPublicMessage(line);
                        } else if (answer === 'private') {
                            terminal.question('address? ', (address) => {
                                console.log(`I sorry, private messages isn't implemented`)
                            })
                        } else {
                            console.log(`I don't understand, sorry`)
                        }
                    });
            }

            if (terminal.isMuted())
                terminal.setMuted(false)
        })

        terminal.on('SIGINT', function (rl) {
            rl.question('Confirm exit: ', (answer) => answer.match(/^y(es)?$/i) ? process.exit(0) : rl.output.write('\x1B[1K> '))
        })

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
}

module.exports = new Terminal();