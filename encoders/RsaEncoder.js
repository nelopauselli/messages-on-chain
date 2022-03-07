const crypto = require('crypto');
const fs = require("fs");
const path = require("path");

class RsaEncoder {
    encode(to, content) {
        return new Promise(function (resolve, reject) {
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
    decode(from, content) {
        return new Promise(function (resolve, reject) {
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