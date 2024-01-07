const express = require('express');
const router = express.Router();
const passport = require('passport');
// error handler
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const users = require('../controllers/users');
const {storeReturnTo} = require('../middleware');
router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser))
router.route('/login')
    .get(users.renderLogin) 
    .post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login);
//passport package, authenticate middlware function
// as opposed to bcrypt.compare()
// have to specify for authenticate
// storeReturnTo called before authenticate because authenticate clear/deletes the session data
router.get('/logout',users.logout); 
module.exports = router;