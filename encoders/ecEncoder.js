/*
 * ref: https://ethereum.stackexchange.com/questions/78815/ethers-js-recover-public-key-from-contract-deployment-via-v-r-s-values 
 */
const { ethers } = require("ethers");

class EcEncoder {
    async getPublicKey(tx) {
        const expandedSig = { r: tx.r, s: tx.s, v: tx.v };
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

    encode(to, content) {
        return new Promise(function (resolve, reject) {
            reject("not implemented");
        });
    }
    decode(from, content) {
        return new Promise(function (resolve, reject) {
            reject("not implemented");
        });
    }
}

module.exports = EcEncoder;