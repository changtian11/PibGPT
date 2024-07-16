require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./utils/db');
const { createUploadDirs } = require('./utils/fileUtil')

connectDB();
createUploadDirs();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});