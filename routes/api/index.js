//import the express module
const express=require('express');
//createing instance router that help to separate the route & controller
const router=express.Router();

//router for the v1 api requests
router.use('/v1',require('./v1'));

//exporting router config to all files so that index.js(of route) can use it
module.exports=router;