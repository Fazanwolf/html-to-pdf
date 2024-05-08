require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./src/config/config');
const router = require('./src/routes/router');
const { engine } = require('express-handlebars');

const app = express();
app.use(cors());
app.use(router);

// Set up handlebars
app.engine('handlebars', engine({ defaultLayout: null }));
app.set('view engine', 'handlebars');
app.set('views', './views');

console.log("Serving static files: " + __dirname + '/public');
app.use(express.static(__dirname + '/public'));

const port = config.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}!`));