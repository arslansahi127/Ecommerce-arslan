const express=require('express');
const router=express.Router();

const { requireSignin,isAuth} =require('../controllers/auth')
const {generateToken,processPayment} =require('../controllers/braintree')
const {userById} = require('../controllers/user')
router.get('/braintree/getToken/:userId',requireSignin,isAuth,generateToken)
router.post('/braintree/payment/:userId',requireSignin,isAuth,processPayment)
router.param('userId',userById)
module.exports= router