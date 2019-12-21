const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dontenv = require('dotenv');
const cors = require('cors');
require('dotenv').config()

// cors policy
app.use(cors());

// importing routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

// connect to db 
mongoose.Promise = global.Promise;mongoose.connect(process.env.DB_CONNECT);

// middlewares
app.use(express.json());

// route middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);


app.listen(3000, () => console.log('Server is up and running'));