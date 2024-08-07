const chalk = require('chalk');

class Logger {
    source = null;
    prefix = 'PbiGPT-';

    constructor(source) {
        if (source)
            this.source = String(source);
    }

    plain(message) {
        console.log(`[${String(this.prefix + this.source)}] ${message}`);
    }

    info(message) {
        console.info(chalk.blue(`[${String(this.prefix + this.source)}] ${message}`));
    }

    error(message) {
        console.error(chalk.red(`[${String(this.prefix + this.source)}] ${message}`));
    }

    success(message) {
        console.info(chalk.green(`[${String(this.prefix + this.source)}] ${message}`));
    }
}

module.exports = (source) => new Logger(source);