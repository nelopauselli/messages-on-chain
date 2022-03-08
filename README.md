# messages-on-chain
PoC about message on blockchain
* Public messages
* Private messages encrypted using RSA (additional keys are required)
* Private messages encrypted using EC (the wallet's keys are used)

## Getting started
Create a .data directory

![.data foder structure](doc/images/data-folder.png)

* *primary.key* is the wallet's private key (never shared)
* *rsa.pem* is the private key for RSA decryption (never shared)
* *rsa.public_key.pem* is the public key for RSA encryption  (shared)

### Wallet key
The wallet's private key should has balance great than zero to can write messages.
### Generate RSA keys
Generate private key

    $ openssl genrsa -out private_key.pem 4096

Generate public key

    openssl rsa -pubout -in private_key.pem -out public_key.pem

# testnet
* configure Polygon Tesnet Mumbai
* Claim MATIC in https://testmatic.vercel.app/ or https://faucet.polygon.technology/

# References
* [Asymmetric encryption (Public-key cryptography) with Node.js](https://whyboobo.com/devops/tutorials/asymmetric-encryption-with-nodejs/)
* [Elliptic Curve Integrated Encryption Scheme (ECIES)](https://github.com/bitchan/eccrypto#ecies)
* [How to recover the public key and address from a signed message?](https://github.com/ethers-io/ethers.js/issues/447)