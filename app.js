// if were running in develpoment mode, require env variables in this file
if(process.env.NODE_ENV !=='production'){
    require('dotenv').config();
}
// mongodb+srv://denilson:<password>@yelpcamp.mpyzb1r.mongodb.net/?retryWrites=true&w=majority

const express = require('express');
// importing schema model from campground.js
// const Campground = require('./models/campground');
const path = require('path');
const ejsMate  = require('ejs-mate');
const session  = require('express-session');
const flash = require('connect-flash')
// joi package to validate our schema requests to receive specific errors for each attribute
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//npm package= method-override to allow HTML form in edit template to let express use Update/Patch request
const methodOverride = require('method-override');
// expressError class

const ExpressError = require('./utils/ExpressError.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// user model
const User = require('./models/user')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// mongo atlas db
const dbURL = process.env.DB_URL;
// local mongo db
// const dbURL = 'mongodb://localhost:27017/yelp-camp';

const MongoStore = require('connect-mongo');
const store = MongoStore.create({
    mongoUrl:dbURL,
    touchAfter:24*60*60,
    crypto:{
        secret:'secret'
    }
});
store.on('error',function(e){
    console.log('session store error', e)
})

mongoose.connect(dbURL,{});
// mongoose.connect('mongodb://localhost:27017/yelp-camp',{});
const db = mongoose.connection;
// on if error occurs
// .on and .once is node thing
db.on("error",console.error.bind(console,"connection error:"));
// once, executed if success
db.once("open",()=>{
    console.log('Database connected');
});

const app = express();

// express is using ejsMate
app.engine('ejs',ejsMate);
// express is using ejs
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
// parse req.body
app.use(express.urlencoded({extended:true}));
// method override
app.use(methodOverride('_method'));
// 
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());



const sessionConfig = {
    // name for cookie session
    store,
    name :'session',
    secret: 'this will be an actual secret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        //cookie will expire after a day, calculated in miliseconds
        // httpOnly does not allow user to access cookies in broswer using js script
        httpOnly:true,

        expires:Date.now()+86400000,
        maxAge:1000*60*60*24*7
    }

}

app.use(session(sessionConfig));

app.use(flash());
// session security
// contentSecurityPolicy allows us to restrict resources loaded
// app.use(helmet());

/*
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/duhazr5mo/"

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/duhazr5mo/"

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/duhazr5mo/"


];
const fontSrcUrls = [
    "https://res.cloudinary.com/duhazr5mo/"
];
*/
/*
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duhazr5mo/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc   : [ "https://res.cloudinary.com/duhazr5mo/" ],
            childSrc   : [ "blob:" ]

        },
        crossOriginEmbedderPolicy:false
    })
);
*/

//securtiy end 
app.use(passport.initialize());
// passport.session must come after session
app.use(passport.session());
// passport use localstrat from user model
// for localstrat use authenticate method stored in User model, made automatically by Passport
// authenticate is a static function
passport.use(new LocalStrategy(User.authenticate()))
// serealization, how we store user in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    // in all templates/requests we have access to req.user as currentUser
    res.locals.currentUser = req.user;
    // on every single request we have access to whats within flash as success by calling success locally
    res.locals.success = req.flash('success');
    // if there is anything stored within the flash as error
    res.locals.error = req.flash('error');

    next();
})
app.get('/fakeUser',async(req,res)=>{
    const user = new User({email:'colttt@getMaxListeners.com',username:'colt123'})
    const newUser = await User.register(user,'chicken')
    res.send(newUser);
})

// all routes that start with /campgrounds use...
app.use('/campgrounds',campgroundRoutes);
// all routes prefixed with... use reviews routes
app.use('/campgrounds/:id/reviews',reviewRoutes);
// all routes prefixed with...use users routes
app.use('/',userRoutes);

app.get('/',(req,res)=>{
    console.log(req.body)
    res.render('home');
});
// CAMPGROUND ROUTES MOVED TO ROUTE/CAMGROUNDS

// ALL CALLBACK, will run if none of the callback endpoints worked
// this runs if we request for a nonexistent url endpoint
app.all('*',(req,res,next)=>{
    // res.send('404 NOT FOUND');
    // we set the message and error code using the expressError class
    // pass it to next, basic error handler callback
    next(new ExpressError(404,'Page Not Found'));
});
// BASIC ERROR HANDLER CALLBACK, works only if called upon, (try/catch, async wrap...)
app.use((err, req, res, next) => {
    // res.status(500).send('Something broke!')
    const{statusCode = 500} = err;
    // render the error template
    if(!err.message){err.message = 'Oh no Error'}
    res.status(statusCode).render('error',{err});
  });


app.listen(3000,()=>{
    console.log('Serving on port 3000')
})