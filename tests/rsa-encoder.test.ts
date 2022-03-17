import { ok, equal, rejects, notEqual } from 'assert';
import { RsaEncoder } from './../src/encoders/rsaEncoder';

describe("Rsa encoder", function () {
    let encoder: RsaEncoder;

    before(function () {
        encoder = new RsaEncoder();
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