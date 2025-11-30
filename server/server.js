const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require("dotenv").config();
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");

const app = express();

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());

app.use(cors({
	origin: true,
	credentials: true,
}));

app.use("/api/v1/admin", require("./routes/admin.router"));
app.use("/api/v1/payment", require("./routes/payment.router"));
app.use("/api/v1/broadcast", require("./routes/broadcast.router"));

// app.use("/api/v1/upload", require("./AdminService/upload.router.js"));
// app.use("*", (req, res) => res.status(404).json({ error: "not found"}));

module.exports = app;