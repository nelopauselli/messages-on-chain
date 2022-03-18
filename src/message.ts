export class Message {
    text: string;
    level: string;
    metadata: string;

    constructor(text: string, level: string, metadata?: string) {
        this.text = text;
        this.level = level;
        this.metadata = metadata || '';
    }
}

export class TransactionMessage {
    to: string;
    content: Buffer;
    from: string;
    tx: string;
    block: number;

    constructor(to: string, content: Buffer, from: string, tx: string, block: number) {
        this.to = to;
        this.content = content;
        this.from = from;
        this.tx = tx;
        this.block = block;
    }
}