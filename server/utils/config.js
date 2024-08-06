import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import { input } from '@inquirer/prompts';

class Config {
    serverDataRootPath = path.resolve(os.homedir(), 'pibgpt-server');
    config = null;
    configPath = path.resolve(this.serverDataRootPath, 'config.json');

    async initialize() {
        if (fs.existsSync(this.configPath)) {
            this.config = JSON.parse(await fs.readFileSync(this.configPath));
            console.info(chalk.green(`[config] Config loaded from existing file. (${this.configPath})`));
        }
        else {
            const JWT_SECRET = await input({
                required: true,
                message: 'Enter your JWT secret:',
                validate: (input) => input.length > 0 || 'JWT secret cannot be empty'
            })
            const MONGODB_URI = await input({
                required: true,
                message: 'Enter your MongoDB URI:',
                validate: (input) => String(input).startsWith('mongodb') || 'Invalid MongoDB URI format'
            })
            this.config = {
                JWT_SECRET,
                MONGODB_URI
            };
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


    async handleExit(signal) {
        try {
            await this.saveToFile();
            console.log(chalk.blue(`Configuration saved. Exiting due to ${signal}...`));
            process.exit(0);
        } catch (err) {
            console.error(chalk.red(`Error saving config on exit (${signal}):`), err);
            process.exit(1);
        }
    }
}
export default new Config();