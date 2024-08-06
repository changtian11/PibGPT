import chalk from 'chalk';
import config from './utils/config.js';
import express from "express";
import http from 'http';
import * as path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import routes from './routes/index.js';
import wss from './utils/websocket.js';
import { createUploadDirs } from './utils/fileUtil.js';
import { connectDB } from './utils/db.js';

config.initialize().then(() => {
    process.on('SIGINT', () => config.handleExit('SIGINT'));
    process.on('SIGTERM', () => config.handleExit('SIGTERM'));
    // Create upload directories and connect to the database
    createUploadDirs();
    connectDB();

    const app = express();
    const server = http.createServer(app);

    wss.initialize(server);

    const PORT = process.env.PORT || 10086;

    // Middleware setup
    app.use(cors({
        origin: `http://localhost:${PORT}`,
        optionsSuccessStatus: 200
    }));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(express.static(path.join('public')));
    app.use('/', routes);

    // Start the server
    server.listen(PORT, () => {
        console.info(chalk.green("PbiGPT Server") + ' is listening on port ' + chalk.green(PORT));
    });
});
