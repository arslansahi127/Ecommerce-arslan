
const express=require("express")
const mongoose=require('mongoose')
const morgan= require('morgan')
const bodyParser=require('body-parser')
const cookieParser= require('cookie-parser')
const expressValidator=require('express-validator')
const cors=require('cors')
require('dotenv').config()
//import routes
const authRoutes=require('./routes/auth')
const userRoutes=require("./routes/user")
const categoryRouter=require("./routes/category")
const productRouter=require("./routes/product")
const braintreeRouter=require("./routes/braintree")
const orderRouter=require("./routes/order")
// const orderRouter=require("./routes/order")
//app
const app=express()
app.use('/photos', express.static(process.env.PHOTO_DIRECTORY));
//db
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true
    // useCreateIndex: true
}).then(()=>console.log('Database Connected'));
//middleware
app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors())
//router middleware
app.use('/api',authRoutes)
app.use('/api',userRoutes)
app.use('/api',categoryRouter)
app.use("/api", productRouter)
app.use("/api",braintreeRouter)
app.use("/api",orderRouter)
 const port=process.env.PORT || 8000

app.listen(port,()=>{
    console.log(`App running on port ${port}`)
});
