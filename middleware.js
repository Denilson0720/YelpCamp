const {campgroundSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');
const Campground = require('./models/campground');
const Review = require('./models/review');
const {reviewSchema} = require('./schemas.js');
// middlware function
module.exports.isLoggedIn = (req,res,next)=>{
    // coming from passport
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','you must be signed in');
        // return so rest does not run afterwards
        return res.redirect('/login');
    }
    next();
}
module.exports.storeReturnTo = (req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// server side campground validation, joi
module.exports.validateCampground = (req,res,next)=>{
    
    // pass our schema to be validated
    const {error} = campgroundSchema.validate(req.body);
    // if error is caught pass it as ExpressError function and onto basic error handler callback
    if(error){
        // map over error.detials to make join the message
        const msg = error.details.map(el=>el.message).join(',')
        // if error caught we throw an error 
        // must pass the parameters in the correct order our error handler asks for 

        throw new ExpressError(400,msg)
    }else{
        // if we find no error then we just pass onto the route handler, the end point
        next();
    }
}
module.exports.isAuthor = async (req,res,next)=>{
    const {id} = req.params
    const campground = await Campground.findById(id);
    // user._id is made by mongo 
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        console.log(error);
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,msg)
    }else{
        next();
    }

}
// middleware function to prevent deletion routes requests from postman
module.exports.isReviewAuthor = async (req,res,next)=>{
    // we are retrieving reviewId from our req.params given in the delete route
    // we destructure both id seperately to later be able to redirect to campogrund/id only
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    // user._id is made by mongo 
    if(!review.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}