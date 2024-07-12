const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();


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

module.exports = app;
