require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./utils/db');
const { setupWebSocket } = require('./utils/websocket');
const { createUploadDirs } = require('./utils/fileUtil')

connectDB();
createUploadDirs();

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    setupWebSocket(server);
});