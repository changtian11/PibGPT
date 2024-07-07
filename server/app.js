require('dotenv').config(); // Load Env variables
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const apiServer = require('./api');
const setupWebSocket = require('./utils/websocket');
const adminRoutes = require('./routes/admin');
const { connectDB } = require('./utils/db');
const cors = require('cors');

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

// Serve static files
app.use(express.static(path.join('public')));

// Routes
app.use('/', apiServer);
app.use('/admin/', adminRoutes);

// Setup WebSocket
setupWebSocket(server);

// Connect to MongoDB Atlas
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
