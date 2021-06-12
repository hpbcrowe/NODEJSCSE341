const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');

const flash = require('connect-flash');
const multer = require('multer');


const errorController = require('./controllers/error');
require('dotenv').config();

const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI;
//console.log(MONGODB_URI);



const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const PORT = process.env.PORT || 5000 
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname
    );
  }
});

const fileFilter = (req, file, cb) => {
  if (
   file.mimetype === 'image/png' ||
   file.mimetype === 'image/jpg' ||
   file.mimetype === 'image/jpeg'
   ) {
    cb(null, true);
  } else {
    cb(null, false);
  }  
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { userInfo } = require('os');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
); 
app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
  secret: 'my secret', 
  resave: false, 
  saveUninitialized: false, 
  store: store
 })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use((req, res, next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user) {
      return next();
    }
    req.user = user;
    next();
   })
  .catch(err => {
    next(new Error(err));
  });
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('500',errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  //res.redirect('/500');
  console.log(error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});





const corsOptions = {
   // https://sheltered-badlands-18764.herokuapp.com/
    origin: "https://sheltered-badlands-18764.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));



const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

const MONGODB_URL = process.env.MONGODB_URI


//app.listen(3000);
//app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

mongoose
  .connect(
    MONGODB_URL, options
  )
  .then(result => {
 // This should be your user handling code implement following the course videos

 
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });