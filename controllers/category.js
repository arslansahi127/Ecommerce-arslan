const Category= require("../models/category")
const {errorHandler}= require("../helpers/dbErrorHandlers")
exports.create=(req,res)=>{
    const category=new Category(req.body);
    // console.log(category)
    category.save((err,data)=>{
        // console.log(data)
        if(err){
            return res.status(400).json({
                error:"Category not found"
            })
        }
        res.json({data})
    })
}
exports.categoryById=(req,res, next,id)=>{
    Category.findById(id).exec((err,category)=>{
        if(err || !category){
            return res.status(400).json({
                error: "Category not found"
            })
        }
        req.category=category
        next()
    })
}
exports.read=(req,res)=>{
    return res.json(req.category)
}


exports.update=(req,res)=>{
    const category=req.category
    category.name=req.body.name
    category.save((err,data)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })

}

exports.remove=(req,res)=>{
    let category=req.category
    category.remove((err,data)=>{
        if(err){
            return res.status(400).json({
                error:"cannot delete Category "
            })
        }
        res.json({
            message:"Category deleted"
        })
    })
}

exports.list=(req,res)=>{
    Category.find().exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })
}