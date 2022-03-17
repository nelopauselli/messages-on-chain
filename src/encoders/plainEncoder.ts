export class PlainEncoder {
    encode(content: string) {
        return Buffer.from(content, 'utf8');
    }
    decode(content: Buffer) {
        return Buffer.from(content).toString('utf8');
    }
}