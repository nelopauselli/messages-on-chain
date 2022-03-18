import * as path from 'path';
import { ok, equal, rejects, notEqual } from 'assert';
import { RsaEncoder } from './../src/encoders/rsaEncoder';
import { Configuration } from './../src/configuration';

describe("Rsa encoder", function () {
    let encoder: RsaEncoder;
    let configuration: Configuration;

    before(function () {
        configuration = Configuration.from(path.join(__dirname, './settings.json'), 'default');
        encoder = new RsaEncoder(configuration);
    });

    it("Encode", async function () {
        let buffer = await encoder.encode('bob', 'Hello crypto world!');
        let plainEncode = Buffer.from("48656c6c6f2063727970746f20776f726c6421", 'hex');
        ok(buffer);
        notEqual(plainEncode.length, buffer.length);
    });

    it("Encode and Decode", async function () {
        let buffer = await encoder.encode('bob', 'Hello crypto world!');
        let result = await encoder.decode('bob', buffer);
        equal('Hello crypto world!', result);
    });

    it("Decode using other account", async function () {
        let buffer = await encoder.encode('bob', 'Hello crypto world!');
        rejects(async () => await encoder.decode('alice', buffer));
    });
})