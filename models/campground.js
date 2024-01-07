const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url:String,
    filename:String
})
// everytime we call thumbnail
ImageSchema.virtual('thumbnail').get(function(){
    // using a virtual, replace with image manipulation
    return this.url.replace('/upload','/upload/w_200')
})
// pass this to allow mongoose to pass on virtual properties, by default is false
const opts = {toJSON:{virtuals:true}};
const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    geometry: {
        type: {
          type: String,
        // we are returned a point value from geojson,mapbox
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    location:String,
    images:[ImageSchema],
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts);
// virtual property to be accessed for mapbox onclikc popup
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    // using a virtual, replace with image manipulation
    return `
    <strong><a href = "/campgrounds/${this.id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
    
})
CampgroundSchema.post('findOneAndDelete',async function(doc){
    // document already been deleted, therefore we have access to it
    if(doc){
        await Review.deleteMany({
            // remove all Review fields where their id is within our doc(the thing we just deleted),within its reviews array(doc.reviews)
            _id:{
                $in: doc.reviews
            }
        })
    }

})

//exporting the schema as 'Campground'
module.exports = mongoose.model('Campground',CampgroundSchema);
