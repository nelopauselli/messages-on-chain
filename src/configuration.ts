import fs from 'fs';

export class Configuration {
    dataDir: string;
    url: string;
    messagesOnChainPublicAddress: string;

    public static from(path: string, network: string): Configuration {
        let content = fs.readFileSync(path);
        let settings = JSON.parse(content.toString('utf8'));
        let section = settings[network];
        return new Configuration(section.url, section.messagesOnChainPublicAddress, section.dataDir);
    }

    constructor(url: string, messagesOnChainPublicAddress: string, dataDir?: string) {
        this.url = url;
        this.messagesOnChainPublicAddress = messagesOnChainPublicAddress;
        this.dataDir = dataDir || './.data';
    }
}