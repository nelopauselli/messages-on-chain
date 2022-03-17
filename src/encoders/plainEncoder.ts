export class PlainEncoder {
    encode(content: string):Buffer {
        return Buffer.from(content, 'utf8');
    }
    decode(content: Buffer):string {
        return Buffer.from(content).toString('utf8');
    }
}