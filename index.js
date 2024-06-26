require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./src/config/config');
const router = require('./src/routes/router');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(router);
app.set('view engine', 'ejs');
console.log("Serving static files: " + __dirname + '/public');
app.use(express.static(__dirname + '/public'));

const port = config.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}!`));