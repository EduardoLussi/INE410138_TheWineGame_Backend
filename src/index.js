const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const server = require('http').Server(app);

app.use(express.raw({ type: 'image/png', limit: '1mb' }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('./routes'));

server.listen(process.env.PORT);