const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDb = require('./config/dbConnection');

connectDb();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
