// Load-In Environment variables
if (process.env.NODE_ENV !== 'production ') {
    require('dotenv').config()
}

// =========================================================================================================================
// All of our Node Libraries and using them.
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')  // Hash passwords and compare hashed passwords ensuring application is secure.
const passport = require('passport')   // Variable connected to the  npm 'Passport' library we installed.
const flash = require('express-flash')  // Display messages for failed logins
const session = require('express-session')  // This stores and persist users across different pages
const methodOverride = require('method-override')   // Allows us to override the post method to use delete


// =========================================================================================================================
const initialisePassport = require('./passport-config')
initialisePassport(
    passport,
    email => users.find(user => user.email === email),   // Function for finding the user based on the email.
    id => users.find(user => user.id === id)             // Function for comparing users by their id.
)

// Variable to store new users
const users = []

// Allows us to view our index in ejs
app.set('view-engine', 'ejs')

// =========================================================================================================================
// Using our installed libraries
app.use(express.urlencoded({ extended: false})) // Allows us to access the user inputs to be accessed in the request variable inside the post method
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,    // Using our secret key inside .env file
    resave: false,                         // Should we resave our session if nothing is saved = false    
    saveUninitialized: false,              // Do you want to save an empty value in this session = false. 
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// =========================================================================================================================
// Homepage
// ===========
// Successful home page with users name -- Including Middleware function 'checkAuthenticated' to redirect if Pass or Fail.
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

// =========================================================================================================================
// Login Users
// ===========
// Initial login page -- Including Middleware function 'checkNotAuthenticated' to redirect if Pass or Fail.
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs',)
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// =========================================================================================================================
// Registering Users
// =================
// Initial registration page -- Including Middleware function 'checkNotAuthenticated' to redirect if Pass or Fail.
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', )
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login') //Once user .ush is successfull, we want to redirect the user to the login page.
    } catch {
        res.redirect('/register') // Redirect users if the user.push is not successfull, users to re-register.
    }
    console.log(users)
})

// =========================================================================================================================
// Loggin out users - Delete Request - with a callback function
// =================================================================

app.delete('/logout', function(req, res) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login'); // Return users who logout to the 'login' page
    });
  });

// =========================================================================================================================
// Middleware
// If user doesn't exist a TypeError appears, so we need to hide this from visitors
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

// Prevent users who are logged in from returning to the login page
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/') // Return authenticated users to the homepage 
    }
    next()  // Continue with login if not authenticated
}

// =========================================================================================================================
// Localhost location
app.listen(3000) 