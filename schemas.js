const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');
// const Joi = require('joi')
// SERVER SIDE VALIDATION FOR CAMPGROUND
// Specific validation error handling, 
    // using joi package allows us to 
    // catch different errors from different attributes(price, location) without having to write specific handlers for each
    
    const extension = (joi) =>({
        type:'string',
        base:joi.string(),
        messages:{
            'string.escapeHTML':'{{#label}} must not incude HTML!'
        },
        rules:{
            escapeHTML:{
                validate(value,helpers){
                    // clean will consist of sanitizeHTML method and allow no tags nor attributes
                    const clean = sanitizeHTML(value,{
                        // no alloewd tags nor attributes
                        allowedTags:[],
                        allowedAttributes:{}
                    });
                    // if html present clean it
                    if(clean!==value)return helpers.error('string.escapeHTML',{value})
                    return clean;
                }
            } 
        }
    })
    const Joi = BaseJoi.extend(extension);
    
    module.exports.campgroundSchema = Joi.object({
        // campround object iself is required
        campground:Joi.object({
        // each attribute of the schema is required
            title:Joi.string().required().escapeHTML(),
            price:Joi.number().required().min(0),
            // image: Joi.string().required(),
            location: Joi.string().required().escapeHTML(),
            description: Joi.string().required().escapeHTML(),
        }).required(),
        deleteImage:Joi.array()
    });  
// SERVER SIDE VALIDATION FOR REVIEWS
    module.exports.reviewSchema = Joi.object({
        review:Joi.object({
            body:Joi.string().required().escapeHTML(),
            rating:Joi.number().required().min(1).max(5)
        }).required()
    });