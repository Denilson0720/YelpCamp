const Review = require('../models/review');
const Campground = require('../models/campground');
module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    // create a new review using the imported Review model
    // we structued the form data to pass eveyrthing under review ---> review[body] and review[rating]
    const review = new Review(req.body.review);
    // push the newly made review into the camground reviews array
    campground.reviews.push(review);
    // set the author to the newly made id 
    review.author = req.user._id;
    // save from both collections
    await review.save();
    await campground.save();
    req.flash('success','Created New Review')
    res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.deleteReview = async(req,res)=>{
    const{id, reviewId} = req.params;
    // pull, array update operator
    // pulls from an existing array(campgrounds reviews array), all things related to it dfeined by a condition
        // remove from reviews array(from campground._id) a;; reviewId and its associates
        //findByIdAndUpdate and findByIdAndDelete both trigger their own specific middlware
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Succesfully Deleted Review!')
    res.redirect(`/campgrounds/${id}`);
};