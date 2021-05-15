const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');

const User = require('./models/user');

const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const PORT = process.env.PORT || 5000 
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { userInfo } = require('os');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('609de3c0e1720a545c020059')
  .then(user => {
    req.user = user;
    next();
  })
  .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);






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

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://hpbcrowe:SonBetRahCro1@cluster0.gz90y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';


//app.listen(3000);
//app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

mongoose
  .connect(
    MONGODB_URL, options
  )
  .then(result => {
 // This should be your user handling code implement following the course videos
 User.findOne().then(user => {
   if(!user){
     const user = new User({
       name: 'Ben',
       email: 'ben@test.com',
       cart: {
         items: []
       }
     });
     user.save();
   }
 });
   


    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });