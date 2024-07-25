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

const googleAPIKey = process.env['google_API_key']

//add express middleware to parse form data
app.use(express.urlencoded({extended: true}));

//routes
app.get('/', (req, res) => {
  res.render('home')
});

app.get('/itinerary-detail', (req, res) => {
  res.render('itinerary', {googleAPIKey: googleAPIKey});
});

// sign up form submitted
app.post("/user/new", async function(req, res) {
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.emailAddress;
  let password = req.body.password;
  let verifyPassword = req.body.confirmPassword;

  let sql = `INSERT INTO users (firstName, lastName, emailAddress, password)
                VALUES (?, ?, ?, ? )`;
  let params = [fName, lName, email, password];
  let rows = await executeSQL(sql, params);

  res.render('home');
}); 

async function executeSQL(sql, params) {
  return new Promise (function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
        resolve(rows);
    });
  });
}//executeSQL

//start server
app.listen(3000, () =>{
  console.log("Expresss server running...")
});
