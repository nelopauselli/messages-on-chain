class Settings {
    constructor() {
        //this.url =this.url = 'https://rpc-mumbai.maticvigil.com/'; 
        this.url ='http://localhost:7545';
        this.messagesOnChainPublicAddress = '0x6d657373616765732d6f6e2d636861696e2d3031';
    }
}

module.exports = new Settings();