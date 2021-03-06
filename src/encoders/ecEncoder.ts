import { ethers, Transaction } from "ethers";
import * as eccrypto from 'eccrypto';
/*
 * ref: https://ethereum.stackexchange.com/questions/78815/ethers-js-recover-public-key-from-contract-deployment-via-v-r-s-values 
 */

export class EcEncoder {
    async getPublicKey(tx: Transaction) {
        const expandedSig = { r: tx.r || '', s: tx.s, v: tx.v };
        const signature = ethers.utils.joinSignature(expandedSig);

        const txData = {
            gasPrice: tx.gasPrice,
            gasLimit: tx.gasLimit,
            value: tx.value,
            nonce: tx.nonce,
            data: tx.data,
            chainId: tx.chainId,
            to: tx.to
        }
        const rsTx = await ethers.utils.resolveProperties(txData)
        const raw = ethers.utils.serializeTransaction(rsTx);
        const msgHash = ethers.utils.keccak256(raw);
        const msgBytes = ethers.utils.arrayify(msgHash);

        const recoveredPubKey = ethers.utils.recoverPublicKey(msgBytes, signature);

        return recoveredPubKey;
    }

    async encode(publicKey: string, content: string) :Promise<Buffer>{
        let raw = await eccrypto.encrypt(
            Buffer.from(publicKey.substring(2), 'hex'),
            Buffer.from(content, 'utf8'));
        let obj = {
            iv: raw.iv.toString('hex'),
            ephemPublicKey: raw.ephemPublicKey.toString('hex'),
            ciphertext: raw.ciphertext.toString('hex'),
            mac: raw.mac.toString('hex'),
        };
        let json = JSON.stringify(obj);
        return Buffer.from(json, 'utf8');
    }

    decode(privateKey: string, content: Buffer):Promise<Buffer> {
        let obj = JSON.parse(content.toString('utf8'));
        let raw = {
            iv: Buffer.from(obj.iv, 'hex'),
            ephemPublicKey: Buffer.from(obj.ephemPublicKey, 'hex'),
            ciphertext: Buffer.from(obj.ciphertext, 'hex'),
            mac: Buffer.from(obj.mac, 'hex'),
        }
        return eccrypto.decrypt(Buffer.from(privateKey.substring(2), 'hex'), raw);
    }
}