const express = require("express");
const dotenv = require("dotenv");
const client = require("./elasticsearch/client");

const app = express();
dotenv.config({
    path: process.cwd() + "/.env"
})

const port = process.env.HTTP_SERVER_PORT || 7003;
const host = process.env.HTTP_SERVER_HOST || "localhost";

app.listen(
    port,
    host,
    () => {
        console.log(`HTTP Server started at --> http://${host}:${port}`);
    }
);
