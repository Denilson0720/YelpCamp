const express =require('express');
// we have to specify option merge params as express router seperates params,
// meaning we dont have access to req.params from main app.js from here
const router = express.Router({mergeParams:true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const reviews = require('../controllers/reviews');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const{validateReview,isLoggedIn} = require('../middleware.js')

// -------------------------------NEW REVIEWS-------------------------------------
// receive the data from the show page to leave a new review
// we are also passing our middleware(server side review validation using joi) to check that there is no error(all required are existent) before creating a new review
router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));
// -------------------------------DELETE REVIEWS-------------------------------------
// : just signifies its within the req.params
router.delete('/:reviewId',isLoggedIn,catchAsync(reviews.deleteReview));

module.exports = router;
