//import the passport module
const passport=require('passport');
//importing the passport jwt startegy
const JWTStrategy = require('passport-jwt').Strategy;
//importing the extractjwt module to extract from authorization header request
const ExtractJWT = require('passport-jwt').ExtractJwt;
//needing user for authentication/ if user exists
const User=require('../models/user');

require('dotenv').config();

var opts = {    //options
    jwtFromRequest:ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.JWT_SECRET_KEY
    // issuer:
    // audience:
}

passport.use(new JWTStrategy(opts, function(jwtPayLoad, done) {    //options, verify
    // console.log("JWT Payload: ", jwtPayLoad);
    // console.log(jwtPayLoad);
    User.findById(jwtPayLoad.id)
    .then((user)=>{
        if (user) { //if token has been compromised then user must match
            console.log("User found")
            return done(null, user);
        } else {
            console.log("user not found");
            return done(null, false);
        }
    }).catch((err)=>{
        if (err) {
            console.log('Error in finding user information from JWT')
            return done(err, false);
        }
    })
}));

module.exports=passport;