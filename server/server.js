// require('dotenv').config();
const app = require('./app');
const { createUploadDirs } = require('./utils/fileUtil')
const { connectDB } = require('./utils/db');
console.info(`Launching PbiGPT server.`);
createUploadDirs();
connectDB();

const PORT = process.env.PORT || 10086;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});