const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken  = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken});
const {cloudinary} = require('../cloudinary');
module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
};
module.exports.new = (req,res)=>{   
    res.render('campgrounds/new')
};
module.exports.createCampground = async(req,res,next)=>{
    // READ DOCS mapbox/services/geocode
   const geoData = await geocoder.forwardGeocode({
    query:req.body.campground.location,
    limit:1
   }).send()
//    DO ERROR HANDLING IN CASE GEODATA IS NOT RECEIVED

    // error validation is all in validateCampground middleware function, next is called from there as well
    const campground = new Campground(req.body.campground);
    // set geometry to be geometry to set type and coordinates correctly
    campground.geometry = geoData.body.features[0].geometry;
     // map over the files array and map the url and filenames to the f.url and filename values for that specific cloudinary instance
    campground.images = req.files.map(f=>({ url:f.path,filename:f.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground.geometry);
    //saving a flash message as success
    req.flash('success','Succesfully made a new Campground!');
    res.redirect(`/campgrounds/${campground._id}`)

    // if we do catch an error pass it onto next so it can be passed onto our basic error handler
};
module.exports.show = async(req,res)=>{
    // we popualte reviews so that we can have access to the data within the ObjectId from the campground show
    const campground = await Campground.findById(req.params.id).populate({
        //populate the reviews and then populate the author for each review, nested
        path:'reviews',
            populate:{
                path:'author'}
        }).populate('author');

    console.log(campground);
    if(!campground){
        req.flash('error','Cannot find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
};
module.exports.renderEditCampgroundForm = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    // if not campground found
    if(!campground){
        req.flash('error','Cannot find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
};
module.exports.editCampground = async(req,res)=>{
    // get GeoJson data to update geometry
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
       }).send()
    const {id} = req.params;
    console.log(req.body);
    // find campground 
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground});
    // update geometry value for mapbox
    campground.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f=>({url:f.path,filename:f.filename}))
    // push the new images alongside the existent images, so as to not overwrite them
    // spread the imgs to pass then into the push function as individual files
    campground.images.push(...imgs);
    await campground.save();
    // delete specific image object in array where fileName sent in form is present
    // if user selects deletedImages to be sent as array
    if(req.body.deleteImage){
        //DELETION FROM CLOUDINARY
        for(let filename of req.body.deleteImage){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImage}}}});
        console.log(campground.images);
    }
    req.flash('success', 'Successfully Updated Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.deleteCampground = async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted Campground!')
    res.redirect('/campgrounds');
};