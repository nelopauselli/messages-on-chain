const terminal = require('serverline')
import { Message } from './message';

export interface OnSendPublicMessage { (text: string): Promise<void> }
export interface OnSendPrivateMessage { (address: string, text: string): Promise<void> }
export interface GetBalanceCallback { (): Promise<void> }

export interface Logger {
    log(text: string, level: string, metadata?: string): void;
}

export class Terminal implements Logger {
    messages: Message[];
    command: string;
    onSendPublicMessage: OnSendPublicMessage | undefined = undefined;
    onSendPrivateMessage: OnSendPrivateMessage | undefined = undefined;
    getBalance: GetBalanceCallback | undefined = undefined;

    constructor() {
        this.messages = [];
        this.command = "";
    }

    log(text: string, level: string, metadata?: string) {
        if (this.messages.length > process.stdout.rows - 2)
            this.messages.shift();

        let prefix, posfix;
        if (level === 'debug') {
            prefix = '\x1b[2;37m';
            posfix = '\x1b[0;37m';
        } else if (level === 'info') {
            prefix = '\x1b[2;32m';
            posfix = '\x1b[0;37m';
        } else if (level === 'public') {
            prefix = `\x1b[0;37m`;
            posfix = `\x1b[0;37m`;
        } else if (level === 'private') {
            prefix = '\x1b[0;32m';
            posfix = '\x1b[0;37m';
        } else {
            prefix = '';
            posfix = '';
        }

        prefix += ` [${level}] `;
        this.messages.push(new Message(`${prefix}${text}${posfix}`, level, metadata));
    }

    run() {
        process.stdout.write('\x1Bc')

        terminal.init()
        terminal.setCompletion(['help', 'balance', 'clear', 'exit'])

        terminal.setPrompt('\x1b[37m> ')

        terminal.on('line', (line: string) => {
            switch (line) {
                case 'help':
                    this.help();
                    break
                case 'balance':
                    if (this.getBalance)
                        this.getBalance()
                    else
                        this.log('Balance is not implemented', 'error');
                    return true;
                case 'clear':
                    process.stdout.write('\x1Bc');
                    return true;
                case 'exit':
                    process.exit(0);
                case '':
                    this.log('Enter the text of your message or type \'help\'', 'warn');
                    return true;
            }

            terminal.question('public or private? ', (answer: string) => {
                if (answer === 'public') {
                    if (this.onSendPublicMessage)
                        this.onSendPublicMessage(line);
                    else
                        this.log('Public message is not implemented', 'error');
                } else if (answer === 'private') {
                    terminal.question('address? ', (address: string) => {
                        if (this.onSendPrivateMessage)
                            this.onSendPrivateMessage(address, line);
                        else
                            this.log('Private message is not implemented', 'error');
                    })
                } else {
                    console.log(`I don't understand, sorry`)
                }
            });

            if (terminal.isMuted())
                terminal.setMuted(false)

            return false;
        });

        terminal.on('SIGINT', function (rl: any) {
            rl.question('Confirm exit: ', (answer: string) => answer.match(/^y(es)?$/i) ? process.exit(0) : rl.output.write('\x1B[1K> '))
        })

        this.help();
        this.displayFakeLog();
    }

    displayFakeLog() {
        setInterval(() => {
            if (this.messages.length > 0) {
                let message: Message | undefined = this.messages.shift();
                if (message)
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