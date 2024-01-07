const express =require('express');
const router = express.Router();

const {isLoggedIn,isAuthor,validateCampground,isReviewAuthor} = require('../middleware')
// importing exported route functionalities
const campgrounds = require('../controllers/campground');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
// import the cloudinary bucket
const{storage} = require('../cloudinary')
// upload to cloudinary storage address object made in cloudinary/index
const upload = multer({storage})
//ALL ROUTES FUNCTIONS/CALLBACKS HAVE BEEN EXPORTED TO ../controllers/campground, imported as 'campgrounds'
// CRUD routes for campgrounds
// GROUPED INTO FANCY ROUTER.ROUTE
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))
    // setting to array allows mutliple files under image

router.get('/new',isLoggedIn,campgrounds.new);
router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))
router.route('/:id/edit')
    .get(isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditCampgroundForm))
//new must come before next get request as it would be passed as an id

// wrapped in catchAsync instead of try/ catch block, if any error present passed onto basic error handler
// passing our middleware joi functino as another argument/parameter
//protecting our post route as user can still have acces via postman  
//---------------------------- UPDATE----------------------------------------
// PUT route from method override
// what the edit template form will submit to
// ---------------------------------DELETE---------------------------------------
module.exports = router;