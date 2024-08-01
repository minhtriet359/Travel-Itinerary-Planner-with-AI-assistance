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

const googleAPIKey = process.env.google_API_key;

// Initialize OpenAI configuration
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

//API to fetch data from to backend for to front end Homepage
app.get('/api/locations', (req, res) => {
  res.json(locations);
});

//API to fetch data from front end to backend for each locations in itinerary
app.get('/api/itinerary/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  let locationFound = null;
  
  for (const continent in locations){
    for (const location of locations[continent]) {
      if (location.id === id) {
        locationFound = location;
        // return true; 
        break;
      }
    } if (locationFound){      
        // return false;
        break;
      }    
  }  
  if (locationFound) {
    res.json(locationFound);
  }
  console.log(locationFound);
});


//process sign-up request
app.post("/user/new", async function(req, res) {
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.emailAddress.toLowerCase();
  let password = req.body.password;
  let verifyPassword = req.body.confirmPassword;
  let newsletterSignup = req.body.newsletterCheck;
  let subscribed = 0;
  let message = "";

  // verify passwords match
  if (password == verifyPassword) {
    // verify email address does not already exist in database
    let sql = `SELECT * FROM users WHERE emailAddress = ?`;
    let data = await executeSQL(sql, [email]);
    if (data.length > 0) {
      message = "A user with that email address already exists! ";
    } else {
      if (newsletterSignup == "on") {
        subscribed = 1;
      }
      // generate bcrypted password
      let bcryptPassword = generateBcrypt(password);
      let sql = `INSERT INTO users (firstName, lastName, emailAddress, password, subscribed)
                    VALUES (?, ?, ?, ?, ? )`;
      let params = [fName, lName, email, bcryptPassword, subscribed];
      await executeSQL(sql, params);
      message = "Sign up successful! Please sign in. ";
    }
  } else {
    message = "Passwords do not match! Please try again. ";
  }
  res.render('home', {message, googleAPIKey});
});

// process login request
app.post("/user/login", async function(req, res) {
  let email = req.body.emailAddress.toLowerCase();
  let password = req.body.password;
  let passwordHash = "";
  let message = "";

  console.log(email);
  
  let sql = `SELECT * FROM users WHERE emailAddress = ?`;
  let data = await executeSQL(sql, [email]);

  // verify username with that email address exists
  if (data.length > 0) {
    passwordHash = data[0].password;
    const matchPassword = await bcrypt.compare(password, passwordHash);
    console.log(matchPassword);

    // verify correct password
    if (matchPassword) {
      req.session.authenticated = true;
      res.locals.loggedIn = await req.session.authenticated;
      req.session.userId = data[0].firstName + " " + data[0].lastName;
      console.log(req.session.userId);
      message = `Welcome back, ${req.session.userId}! `;
    } else {
      message = "Incorrect Password  ";
    }
  } else {
    message = "Email address not found  ";
  }
  res.render('home', {message, googleAPIKey});
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
  res.render('home', {message, googleAPIKey});
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
    console.log(req.session.userId);
    next();
  } else {
    res.redirect("/");
  }
}

//start server
app.listen(3000, () =>{
  console.log("Expresss server running...")
});
