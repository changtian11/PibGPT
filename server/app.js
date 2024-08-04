const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const wss = require('./utils/websocket');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Middleware setup
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
wss.initializer(server);
app.locals.wss = wss;

module.exports = server;
