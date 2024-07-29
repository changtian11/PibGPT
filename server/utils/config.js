const os = require('os');
const path = require('path');
const fs = require('fs');

class CustomConfig {
    config = null;
    defaultConfig = require('../config/default.json');
    serverDataRootPath = path.resolve(os.homedir(), 'pibgpt-server');
    configPath = path.resolve(this.serverDataRootPath, 'config');

    constructor() {
        try {
            if (!fs.existsSync(path.resolve(this.configPath, 'default.json'))) {
                if (!fs.existsSync(this.configPath)) fs.mkdirSync(this.configPath, { recursive: true });
                fs.writeFileSync(path.resolve(this.configPath, 'default.json'), JSON.stringify(this.defaultConfig));
            }
            this.config = require(path.resolve(this.configPath, 'default.json'));
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    get(property) {
        if (!!this.config) {
            return this.config[property];
        }
    }

}

module.exports = new CustomConfig();