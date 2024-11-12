// const express = require('express');
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3001;


import fs from 'fs';
import path from 'path';
import engine from 'consolidate';
import compression from 'compression';

// const fs = require('fs');
// const path = require('path');
// const engine = require("consolidate");
// const compression = require('compression')

// compress all responses
app.use(compression());

// middleware to enable SharedBuffer to be used
app.use(function(req, res, next) {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

const __dirname = path.resolve();


app.use(express.static(path.join(__dirname, "public")))
.set("views", path.join(__dirname, "views"))
.engine("html", engine.mustache)
.set("view engine", "html")
.get("/", (req, res) => res.render("index.html"))
.get("/index.html", (req, res) => res.render("index.html"))
.get("/index2.html", (req, res) => res.render("index2.html"))
.get("/index3.html", (req, res) => res.render("index3.html"))
.get("/index4.html", (req, res) => res.render("index4.html"))

.listen(PORT, () => {
  console.log(`FFmpeg App is listening on port ${PORT}!`)
});