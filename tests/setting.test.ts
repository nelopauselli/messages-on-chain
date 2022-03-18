import { ok, equal } from 'assert';
import path from 'path';
import { Configuration } from './../src/configuration';

describe("Settings", function () {
    it("Default", function () {
        let configuration = new Configuration( "http://localhost:7545", '0x6d657373616765732d6f6e2d636861696e2d3031');
        ok(configuration);
        equal('http://localhost:7545', configuration.url);
        equal('0x6d657373616765732d6f6e2d636861696e2d3031', configuration.messagesOnChainPublicAddress);
    });

    it("Mumbai", function () {
        let configuration = Configuration.from(path.join(__dirname, './../settings.json'), 'mumbai');

        ok(configuration);
        equal('https://rpc-mumbai.maticvigil.com/', configuration.url);
        equal('0x6d657373616765732d6f6e2d636861696e2d3031', configuration.messagesOnChainPublicAddress);
    });
})