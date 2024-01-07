// self contained meaning it connects to mongoose and the database from itself 
// importing schema model from campground.js
const Campground = require('../models/campground');
const mongoose = require('mongoose');

// importing cities
const cities = require('./cities')
// importing seedHelper arrays
const {descriptors,places} = require('./seedHelper')


// connection to mongo database with mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp',{});
const db = mongoose.connection;
// on if error occurs
// .on and .once is node thing
db.on("error",console.error.bind(console,"connection error:"));
// once, executed if success
db.once("open",()=>{
    console.log('Database connected');
});
// pick a random element from an array method save to sample
const sample = (array) => array[Math.floor(Math.random()*array.length)];
// input 50 new campgrounds with random locations based off city and states
const seedDB = async()=>{
    // deletes all
    await Campground.deleteMany({});
    for(let i =0;i<300;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20+10)
        const camp = new Campground({
            author:'658cb1f3e83473f4b8066628',
            // cities and state
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            // random description from description array, also from places array
            title:`${sample(descriptors)} ${sample(places)}`,
            // image:'https://source.unsplash.com/collection/483251/',
            // seed to cloudinary pictures
            images: [
                {
                  url: 'https://res.cloudinary.com/duhazr5mo/image/upload/v1704323159/YelpCamp/tnt1rjett8i5e2rn1psr.jpg',
                  filename: 'YelpCamp/tnt1rjett8i5e2rn1psr',             
                },
                { url: 'https://res.cloudinary.com/duhazr5mo/image/upload/v1704323190/YelpCamp/u2fqje78wg7bwujtalst.jpg',
                  filename: 'YelpCamp/u2fqje78wg7bwujtalst'
                }
              ],
            description:'This is a pretty sick campsite! Just look at that picture that wasnt automatically generated from an unsplash album collection',
            // shorthand instead of setting price:price
            price,
            // hardcode geometry in case user does not include Location 
            geometry:{
              type:"Point",
              coordinates:[
                cities[random1000].longitude,
                cities[random1000].latitude
                ]
              }
            
        })
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();}
    )