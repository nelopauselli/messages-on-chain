import { ok, equal } from 'assert';
import path from 'path';
import { Settings } from './../src/settings';

describe("Settings", function () {
    it("Default", function () {
        let config = Settings.from(path.join(__dirname, './../settings.json'), 'default');

        ok(config);
        equal('http://localhost:7545', config.url);
        equal('0x6d657373616765732d6f6e2d636861696e2d3031', config.messagesOnChainPublicAddress);
    });

    it("Mumbai", function () {
        let config = Settings.from(path.join(__dirname, './../settings.json'), 'mumbai');

        ok(config);
        equal('https://rpc-mumbai.maticvigil.com/', config.url);
        equal('0x6d657373616765732d6f6e2d636861696e2d3031', config.messagesOnChainPublicAddress);
    });
})