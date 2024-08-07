const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const wss = require('./utils/websocket');
const config = require('./utils/config');
const { createUploadDirs } = require('./utils/fileUtil')
const { connectDB } = require('./utils/db');
const logger = require('./utils/logger')('main');


const PORT = process.env.PORT || 10086;

const serverInit = async () => {
    logger.info(`Initializing PbiGPT server.`);
    await config.initialize();
    await createUploadDirs();
    await connectDB();

    const app = express();

    app.listen(PORT, () => {
        logger.info(`Server is listening on port ${PORT}`);
    });

    app.use(cors(
        {
            origin: `http://localhost:${PORT}`,
            optionsSuccessStatus: 200
        }
    ))
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));


    app.use(express.static(path.join('public')));
    app.use('/', routes);
    const server = http.createServer(app);
    await wss.initialize(server);

}

serverInit();