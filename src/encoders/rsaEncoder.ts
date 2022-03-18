import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Configuration } from 'src/configuration';

export class RsaEncoder {
    dataDir: string;
    constructor(configuration: Configuration) {
        this.dataDir = configuration.dataDir;
    }

    encode(to: string, content: string): Promise<Buffer> {
        return new Promise((resolve) => {
            console.log('loading public key for ' + to);
            let publicKey = fs.readFileSync(path.join(this.dataDir, to, 'rsa.public_key.pem'), 'utf8');

            let buffer = crypto.publicEncrypt({
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
                Buffer.from(content, 'utf8')
            );

            resolve(buffer);
        });
    }
    decode(from: string, content: Buffer): Promise<string> {
        return new Promise((resolve) => {
            let privateKey = fs.readFileSync(path.join(this.dataDir, from, 'rsa.pem'), 'utf8');

            let raw = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                content
            );

            let plain = raw.toString('utf8');
            resolve(plain);
        });
    }
}