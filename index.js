const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()

// connection port
const port = process.env.PORT || 3000;

// cors policy
app.use(cors());

// importing routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

// connect to db 
mongoose.Promise = global.Promise;mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});

// middlewares
app.use(express.json());

// route middlewares
app.use('/auth', authRoute);
app.use('/posts', postRoute);


app.listen(port, () => console.log(`Server is up and running on port ${port}`));