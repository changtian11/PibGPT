const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { setupWebSocket } = require('./utils/websocket');

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cors(
    {
        origin: 'http://localhost:3000',
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

app.locals.wss = setupWebSocket(server);

module.exports = server;
