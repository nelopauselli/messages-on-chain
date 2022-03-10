const fs = require('fs');

class Settings {
    static from(path, network) {
        let content = fs.readFileSync(path);
        let settings = JSON.parse(content);
        return settings[network];
    }
}

module.exports = Settings;