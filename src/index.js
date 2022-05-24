require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api', require('./routes/user.router'));
app.use('/api', require('./routes/repository.router'));
app.use('/api', require('./routes/auth.router'));

const port = process.env.PORT || 3000;

app.listen(port)

console.log('Server on port '+port);



