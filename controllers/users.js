const User = require('../models/user');

module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register')
};
module.exports.registerUser = async(req,res,next)=>{
    // adding our own try catch block within the catchAsync
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    // make a new userusing the user and hashed password, password npm does hashing and salts BTS
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) return next(err);
        req.flash('success','welcome to yelp camp!');
        res.redirect('/campgrounds');
    })
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')
    }
};
module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
};
module.exports.login =(req,res)=>{
    req.flash('success','welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
};
module.exports.logout = (req, res, next) => {
    // passport, hiding sessions and cookies BTS
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};