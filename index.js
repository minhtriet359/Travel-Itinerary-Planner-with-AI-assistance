const express = require('express');
const session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require('mysql');
const pool=require('./dbpool.js')

const path = require('path');

require("dotenv").config();
const OpenAI = require('openai');

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

const googleAPIKey = process.env['google_API_key'];

//Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

// Define the path to the data folder and JSON file
const locationsPath = path.join(__dirname, 'data', 'locations.json');
const locations = require(locationsPath);


//add express middleware to parse form data
app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.locals.userId = req.session.userId;
  res.locals.loggedIn = req.session.authenticated;
  next();
});

//routes
app.get('/', (req, res) => {
  res.render('home',{googleAPIKey})
});

app.get('/itinerary-detail', (req, res) => {
  const { destination, startDate, endDate, guests } = req.query;
  res.render('itinerary', {googleAPIKey, destination, startDate, endDate, guests});
});

app.get('/savedItineraries', isAuthenticated, (req, res) => {
  res.render('savedItineraries',{googleAPIKey})
});

//API to fetch data from front end to backend
app.get('/api/locations', (req, res) => {
  res.json(locations);
});

//process sign-up request
app.post("/user/new", async function(req, res) {
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.emailAddress;
  let password = req.body.password;
  let verifyPassword = req.body.confirmPassword;
  let newsletterSignup = req.body.newsletterCheck;
  let subscribed = 0;
  
  if (newsletterSignup == "on") {
    subscribed = 1;
  }
  
  // generate bcrypt
  let bcryptPassword = generateBcrypt(password);
  
  let sql = `INSERT INTO users (firstName, lastName, emailAddress, password, subscribed)
                VALUES (?, ?, ?, ?, ? )`;
  let params = [fName, lName, email, bcryptPassword, subscribed];
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
    console.log("Incorrect login");
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
app.get('/logout', isAuthenticated, (req, res) => {
  req.session.authenticated = false;
  req.session.destroy();   // remove the session, including all variables
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

//Chatbot
app.get('/chatbot', (req, res) => {
  res.render('chatbot', { googleAPIKey: googleAPIKey});
});

app.post('/chatbot-response', async (req, res) => {
  const userQuery = req.body.query;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a travel assistant. Provide helpful information about travel destinations, tips, and itineraries.' },
        { role: 'user', content: userQuery },
      ],
    });

    const assistantResponse = response.choices[0].message.content;
    res.render('chatbot', { query: userQuery, response: assistantResponse, googleAPIKey: googleAPIKey });
  } catch (error) {
    console.error('Error:', error); // Log the error details
    res.render('chatbot', { query: userQuery, response: 'An error occurred while processing your request.', googleAPIKey: googleAPIKey });
  }
});

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

<<<<<<< HEAD

// API endpoint to get locations data
app.get('/api/locations', (req, res) => {
  res.json(locations);
})


=======
>>>>>>> fd8a095ae1bf6ada19cf1573235dacaf10b6da08
//start server
app.listen(3000, () =>{
  console.log("Expresss server running...")
});
