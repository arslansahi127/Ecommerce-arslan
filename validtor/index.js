exports.userSignUpValidator=(req,res,next)=>{
    req.check('name',"Name is required").notEmpty()
    req.check('email',"Email is required").matches(/.+\@.+\..+/).withMessage("Emial Must contains @").isLength({
        min:4,
        max:32
    });
    req.check('password','Password is required').notEmpty()
    req.check('password').isLength({min:6}).withMessage("Password must contains atleast 6 characters").matches(/\d/)
    .withMessage("Password must contains a num")
    const errors= req.validationErrors()
    if(errors){
        const firstError=errors.map(error=>error.msg)[0];
        return res.status(400).json({error: firstError});
    }
    next();
};
