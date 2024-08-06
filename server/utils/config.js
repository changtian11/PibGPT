const os = require('os');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

class Config {
    config = null;
    serverDataRootPath = path.resolve(os.homedir(), 'pibgpt-server');
    configPath = path.resolve(this.serverDataRootPath, 'config.json');

    async initialize() {
        if (fs.existsSync(this.configPath)) {
            this.config = require(this.configPath);
            console.log(chalk.green(`Config loaded from existing file. (${this.configPath})`));
        }
        else {
            const ans = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'JWT_SECRET',
                    message: 'Enter your JWT secret:',
                    validate: (input) => input.length > 0 || 'JWT secret cannot be empty'
                },
                {
                    type: 'input',
                    name: 'MONGODB_URI',
                    message: 'Enter your MongoDB URI:',
                    validate: (input) => input.startsWith('mongodb') || 'Invalid MongoDB URI format'
                }
            ]);
            this.config = ans;
            this.saveToFile()
                .catch(err => {

                })
        }
    }

    get(property) {
        if (!!this.config) {
            return this.config[property];
        }
    }

    async set(property, value) {
        if (!this.config) {
            await this.initialize();
        }

        this.config[property] = value;

        this.saveToFile()
            .catch(err => {

            })
    }

    async saveToFile() {
        try {
            if (!fs.existsSync(this.serverDataRootPath)) {
                fs.mkdirSync(this.serverDataRootPath, { recursive: true });
            }
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log(chalk.green(`Config saved to file. (${this.configPath})`));
        }

        catch (err) {
            console.error(chalk.red('Error saving config:'), err);
            throw err;
        }
    }
}

async function handleExit(signal) {
    try {
        await config.saveToFile();
        console.log(chalk.blue(`Configuration saved. Exiting due to ${signal}...`));
        process.exit(0);
    } catch (err) {
        console.error(chalk.red(`Error saving config on exit (${signal}):`), err);
        process.exit(1);
    }
}

const config = new Config();

// IIFE
(async () => {
    try {
        await config.initialize();
    }
    catch (err) {
        console.error(chalk.red("Failed to init config: ", err));
        process.exit(1);
    }

    process.on('SIGINT', () => handleExit('SIGINT'));
    process.on('SIGTERM', ()=> handleExit('SIGTERM'));
})

module.exports = new Config();