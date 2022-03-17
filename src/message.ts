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
    content: Buffer;
    from: string;
    tx: string;
    block: number;

    constructor(content: Buffer, from: string, tx: string, block: number) {
        this.content = content;
        this.from = from;
        this.tx = tx;
        this.block = block;
    }
}