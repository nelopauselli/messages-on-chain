import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class RsaEncoder {
    encode(to:string, content:string) {
        return new Promise(function (resolve) {
            console.log('loading public key for ' + to);
            let publicKey = fs.readFileSync(path.join(__dirname, '../.data', to, 'rsa.public_key.pem'), 'utf8');

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
    decode(from:string, content:Buffer) {
        return new Promise(function (resolve) {
            let privateKey = fs.readFileSync(path.join(__dirname, '../.data', from, 'rsa.pem'), 'utf8');

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

module.exports = RsaEncoder;