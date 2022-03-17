import fs from 'fs';

export class Settings {
    static from(path: string, network: string) {
        let content = fs.readFileSync(path);
        let settings = JSON.parse(content.toString('utf8'));
        return settings[network];
    }
}