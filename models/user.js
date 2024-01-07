const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        // sets up index
        unique:true
    }
});
// add to the schema, usernmae,password, make sure usernames are not duplicates
// hides all backend functionalitiy behind passport
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',UserSchema);