const Product = require("../models/product")
const formidable = require("formidable")
const _ = require("lodash")
const { errorHandler } = require("../helpers/dbErrorHandlers")

const fs = require("fs/promises");
const path = require("path");
const express = require('express');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
      
        const {name, description,price, category, quantity, shipping}= fields;
        if(!name || !description || !price || !category || !quantity || !shipping){
            // console.log(name);
            // console.log(description);
            // console.log(price);
            // console.log(category);
            // console.log(quantity);
            //  console.log("Shipping",shipping);
            return res.status(400).json({
                error: "All fields are required"
            });
        }
        let product = new Product(fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo && process.env.PHOTO_DIRECTORY) {
            //file size validation
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                })
            }
            // Create the path to upload the file.
            let filepath = path.join(process.env.PHOTO_DIRECTORY, files.photo.originalFilename);

            // Upload the photo to PHOTO_DIRECTORY
            await fs.rename(files.photo.filepath, filepath);

            //console.log("FILES PHOTO: ", files.photo);
            product.photoPath = filepath;
            product.photoName = files.photo.originalFilename;
            product.contentType = files.photo.mimetype;
        }

        product.save((err, result) => {
            if (err) {
                console.log('PRODUCT CREATE ERROR ', err);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.productById= (req,res,next,id)=> {
    Product.findById(id)
    .populate('category')
    .exec((err,product)=>{
        if(err || !product){
            return res.status(400).json({
                error: "Product Not found"
            })
        }
        req.product= product
        next()
    })
}

exports.read=(req,res)=>{
    req.product.photo=undefined
    return res.json(req.product)
}
exports.remove=(req,res)=>{
    let product= req.product
    product.remove((err,deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json({
            deletedProduct,
            message: "Product Deleted Successfully"
        })
    })
}

exports.update=(req,res)=>{
    let form = new formidable.IncomingForm()
    form.keepExtensions= true
    form.parse(req, async(err, fields, files)=>{
        if(err){
            return res.status(400).json({
                error: "Image could not updated"
            })
        }

        // const {name,description, price, category,quantity,shipping}=fields
        // if(!name || !description || !price || !category || !quantity || !shipping){
        //     return res.status(400).json({
        //         message:" All fields are required"
        //     })
        // }
        let product=req.product
        product=_.extend(product,fields)

        if(files.photo && process.env.PHOTO_DIRECTORY){
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                })
            }
            let filepath= path.join(process.env.PHOTO_DIRECTORY, files.photo.originalFilename)
            console.log(filepath)
            await fs.rename(files.photo.filepath, filepath)

            product.photoPath=filepath
            product.photoName= files.photo.originalFilename
            product.contentType= files.photo.mimetype
        }
        product.save((err,result)=>{
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result)
        })
    })
}
/*
**sell/arrival
**by sell = /products?sortBy=sold&order=desc&limit=4
**by arrival= /product?sortBy=createdAt&order=desc&limit=4
** if no params are sent then all products are returned
*/
exports.list=(req,res)=>{
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limt ? req.query.limt : 6

    Product.find().select('-photo').populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error: "Products not found"
            })
        }
        res.json(data)
    })
}
/*
** it will find the product based on req product query
** other products that has the same category, will be returned
*/
exports.listRelated=(req,res)=>{
   let limit= req.query.limit ? req.query.limit : 6
   
   
   Product.find({_id:{$ne: req.product},category: req.product.category})
   .limit(limit)
   .populate('category','_id name')
   .exec((err,products)=>{
       if(err){
           return res.json(400).json({
               error:"Product not found"
           })
       }
       res.json(products)
   })
}


exports.listCategories=(req,res)=>{
    Product.distinct('category',{},(err,categories)=>{
        if(err){
            return res.status(400).json({
                error:" Categories not found"
            })
        }
        res.json(categories)
    })
}
/*
** list product by search
** we will implement product search in react front end 
** we will show category in check box and price range in radio buttons
** as the user clicks those checkbox and radio buttions
** we will make api request and show product to user base on what he wants
*/

exports.listBySearch=(req,res)=>{
    let order = req.body.order ? req.body.order : 'desc'
    let sortBy= req.body.sortBy ? req.body.sortBy : "_id"
    let limit = req.body.limit ? req.body.limit : 100
    let skip = parseInt(req.body.skip)
    let findArgs={}


    for(let key in req.body.filters){
        if(req.body.filters[key].length>0){
            if(key ==="price"){
                findArgs[key]={
                    $gte:req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            }
            else{
                 findArgs[key]=req.body.filters[key]   
            }
        }
    }
    Product.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy,order]])
    .skip(skip)
    .limit(limit)
    .exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error: "Products not found"
            })
        }
        res.json({
            size: data.length,
            data
        })
    })
}

exports.photo = (req, res, next) => {
      Product.findById(req.product.id,  (err, items) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            let  service_pic = process.env.URL +'/photos/'+ items.photoName;
             return res.status(200).json(service_pic);
        } 
    }); 
};

exports.listSearch=(req,res)=>{
const query={}
if(req.query.search){
    query.name={$regex:req.query.search,$options:'i'}
    if(req.query.category && req.query.category !='All'){
        query.category=req.query.category
    }
    Product.find(query,(err,products)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        res.json(products)
    }).select('-photo')
}
}

exports.decreaseQuantity=(req,res,next)=>{
    let bulkOps=req.body.order.products.map((item)=>{
        return{
            updateOne:{
                filter:{_id:item._id},
                update:{$inc:{quantity:-item.count,sold:+item.count}}
            }
        }
    })
    Product.bulkWrite(bulkOps,{},(error,products)=>{
        if(error){
            return res.status(400).json({
                error:'Could not update the product'
            })
        }
        next()
    })
}