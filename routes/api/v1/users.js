//import the express module
const express=require('express');
//createing instance router that help to separate the route & controller
const router=express.Router();

const userApi=require('../../../controllers/api/v1/users_api');
// route for the signup
router.post('/create',userApi.create);
//route for login
router.post('/create-session',userApi.createSession);
// Route to reset password
router.post('/reset-password', userApi.resetPassword);

//exporting router config to all files so that index.js(of v1) can use it
module.exports=router;