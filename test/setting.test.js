var assert = require('assert');
const path = require("path");
const Settings = require('./../settings');

describe("Settings", function () {
    it("Default", function () {
        let config = Settings.from(path.join(__dirname, './../settings.json'), 'default');

        assert(config);
        assert.equal('http://localhost:7545', config.url);
        assert.equal('0x6d657373616765732d6f6e2d636861696e2d3031', config.messagesOnChainPublicAddress);
    });

    it("Mumbai", function () {
        let config = Settings.from(path.join(__dirname, './../settings.json'), 'mumbai');
        
        assert(config);
        assert.equal('https://rpc-mumbai.maticvigil.com/', config.url);
        assert.equal('0x6d657373616765732d6f6e2d636861696e2d3031', config.messagesOnChainPublicAddress);
    });
})