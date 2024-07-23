const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const pool=require('./dbpool.js')

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({
  secret: "top secret!",
  resave: true,
  saveUninitialized: true
}));

//add express middleware to parse form data
app.use(express.urlencoded({extended: true}));

//routes
app.get('/', (req, res) => {
  res.render('index')
});

//start server
app.listen(3000, () =>{
  console.log("Expresss server running...")
});