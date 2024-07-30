const express = require('express');
const session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require('mysql');
const pool=require('./dbpool.js')

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.set('trust proxy', 1)
app.use(session({
  secret: "top secret!",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}));

const googleAPIKey = process.env['google_API_key']

//add express middleware to parse form data
app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.locals.userId = req.session.userId;
  res.locals.loggedIn = req.session.authenticated;
  next();
});

//routes
app.get('/', (req, res) => {
  res.render('home',{googleAPIKey: googleAPIKey})
});

app.get('/itinerary-detail', (req, res) => {
  
  res.render('itinerary', {googleAPIKey: googleAPIKey});
});

//process sign-up request
app.post("/user/new", async function(req, res) {
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.emailAddress;
  let password = req.body.password;
  let verifyPassword = req.body.confirmPassword;

  // generate bcrypt
  let bcryptPassword = generateBcrypt(password);
  
  let sql = `INSERT INTO users (firstName, lastName, emailAddress, password)
                VALUES (?, ?, ?, ? )`;
  let params = [fName, lName, email, bcryptPassword];
  let rows = await executeSQL(sql, params);

  res.render('home');
});

// process login request
app.post("/user/login", async function(req, res) {
  let email = req.body.emailAddress;
  let password = req.body.password;
  let message = "";
  
  let passwordHash = "";
  
  let sql = `SELECT * FROM users WHERE emailAddress = ?`;
  let data = await executeSQL(sql, [email]);

  if (data.length > 0) {
    passwordHash = data[0].password;
  } else {
    message = "Invalid Email";
  }
  const matchPassword = await bcrypt.compare(password, passwordHash);
  console.log(matchPassword);
  if (matchPassword) {
    console.log("correct login");
    req.session.authenticated = true;
    res.locals.loggedIn = await req.session.authenticated;
    req.session.userId = data[0].firstName + " " + data[0].lastName;
    console.log(req.session.userId);
  } else {
    console.log("WRONGGGG");
  }
  res.redirect('/loginAttempt');
});

app.get('/loginAttempt', (req, res) => {
  let message = "";
  if (req.session.authenticated) {
    message = `Welcome back, ${req.session.userId}!`;
  } else {
    message = "Invalid Credentials";
  }
  res.render('home', {message:message});
});

// log out
app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  req.session.destroy();   // remove the session, including all variables
  let message = "Logged Out";
  res.redirect('/loggedOut');
});

app.get('/loggedOut', (req, res) => {
  let message = "";
  if (!req.session.authenticated) {
    message = "Logged out";
  } else {
    message = "Error Logging Out";
  }
  res.render('home', {message:message});
})

// functions
async function executeSQL(sql, params) {
  return new Promise (function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
        resolve(rows);
    });
  });
}//executeSQL

// plan text password -> bcrypt password
function generateBcrypt(plainTextPassword) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(plainTextPassword, salt);
  return hash;
}

// middleware function for verifying user has been authenticated 
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    console.log(user);
    next();
  } else {
    res.redirect("/");
  }
}


//start server
app.listen(3000, () =>{
  console.log("Expresss server running...")
});
