var express = require("express");
var limit = require("simple-rate-limiter");
var request = limit(require("request")).to(1000).per(10000);
var app = express();
app.use(express.json());

const router = require('./router');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(router);    
module.exports = app;
