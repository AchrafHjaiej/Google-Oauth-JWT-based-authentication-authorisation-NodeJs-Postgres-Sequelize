var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
//var session = require('express-session')
var helmet = require('helmet');
var cors = require('cors');
var rateLimit = require('express-rate-limit');
var compression = require('compression');
var app = express();

const db = require("./app/model");
const Role = db.role;

const User = require('./app/model/User'); // <-- Added this line

db.sequelize.sync({ force: false }) // Don't force sync, as it drops the table if it already exists
 .then(() => console.log('Users table created successfully'))
 .catch(err => console.error('Could not create Users table', err));

 async function syncDatabase() {
  try {
    await User.sync();
    console.log('User table synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing User table:', error);
  }
}


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Clevory application." });
});



app.use(cookieSession({
  name: 'session',
  secret: 'flymetothemoon', // provide a secure and random string
  resave: true,
  saveUninitialized: true,
}));

app.use(flash()); // Initialize connect-flash before passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(helmet());
app.use(cors());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ... (other middleware)
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

console.log("passport : "+ passport)

// ... (rest of the middleware)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const passportFunctions = require('./app/config/passport');
passportFunctions.passportConfig(passport);
;
require('./routes/routes')(app, passport);

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
app.use(function(req, res, next) {
  // Set the authenticated user in the
  // template locals
  if (req.user) {
   res.locals.user = req.user.profile;
  }
  next();
 });

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//catch 500 and forward to error handler
app.use(function(err, req, res, next) {
  console.error('Unhandled error:', err);
  res.status(500).send('Something broke!');
});


// error handlers
// app.js or index.js (your main application file)



app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'] }));

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
const port = process.env.PORT || 3000;
const http = require('http');

http.createServer(app).listen(3000);
{
    console.log(`HTTP Server running on port ${port}`);
};

function initial() {
  Role.create({
    id: 1,
    name: "Etudiant"
  });
 
  Role.create({
    id: 2,
    name: "Formateur"
  });
 
  Role.create({
    id: 3,
    name: "Admin"
  });
}

module.exports = app;