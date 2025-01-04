const Products = require('../models/products') ;
const Category = require('../models/category') ;
const Coupen = require('../models/coupon') ;
const Admin = require('../models/admin') ;

const bcrypt = require('bcrypt') ;
const jwt = require('jsonwebtoken') ;

const {productValidator} = require('../utils/productValidator') ;

const getLogin = async (req,res) => {
    res.render('admin/login')
}

const login = async (req,res) => {
    try {
        const {emailId,password} = req.body ;
        
        // find the admin with entered email id
        const admin = await Admin.findOne({emailId}) ;
        if(!admin){
            throw new Error('invalid credentials') ; 
        }

        // validating passwords
        const isPasswordValid = await bcrypt.compare(password,admin.password) ;
        if(!isPasswordValid){
            throw new Error('invalid credentials') ;
        }

        // creating jwt token
        const token = jwt.sign({adminId : admin._id }, process.env.JWT_PRIVATEKEY ) ;
        res.cookie('token',token) ;
        res.json({
            status : true
        })
    } catch (err) {
        console.log(err.message) ;
        res.json({
            loginError : true ,
            message : err.message 
        })
    }
}

const logout = async (req,res) => {
    try {
        res.clearCookie('token') ;
        res.redirect('/admin/login') ;
    } catch (err) {
        console.log(err.message)
    }
}

const getDashboard = async (req,res) =>{
   try {
    const admin = req.admin ;
    console.log('hey you are in admin dashboard')
    res.render('admin/dashboard', {admin}) ;
   } catch (err) {
    
   }
}

const getProducts = async (req,res) => {
    try {
        const admin = req.admin ;

        // find all products
        const products = await Products
                                    .find({})
                                    .populate('category') ;

        console.log('hey you are in product page') ;
        res.render('admin/products',{products,admin}) ;
    } catch (err) {
        
    }
}

const getAddProduct = async (req,res) => {
    try {

        const categories = await Category
                                .find({}) 
                                
        
        res.render('admin/addProduct' , {categories} ) ;
        
       
    } catch (err) {
        console.log('something went wrong!',err.message)
    }
}

const addProduct = async (req,res) => {

    try {
        const {name,category,price,description,quantity,size,colour} = req.body ; 
        // find the entered category from categoy collection
        const productCategory = await Category.findOne({name:category}) ;

        if(!productCategory){
            throw new Error ('category is not found') ;
        }

        // validating product
        const {isValid,errors} = productValidator(req.body) ;
        if(!isValid){
            throw new Error(errors) ;
        }

        const imagePath = req.file.filename ;

        if(!imagePath) {
            throw new Error('product image is required ') ;
        }

        // creating a new instance of products class
        const newProduct = new Products({
            name,
            price,
            description,
            category : productCategory._id,
            quantity,
            size,
            colour,
            image : imagePath,
           
        })

        // save new product object into products database
        const addedProduct =  await newProduct.save() ;

        console.log(addedProduct) ;
 
        res.redirect('/admin/products/view') ;

    } catch (err) {
       
        console.log('something went wrong!'+err.message) ;
    }
}

const getCategory = async (req,res) => {
    try {

        const allCategory = await Category.find({}) ;
        console.log(allCategory)
        res.render('admin/category', { categories : allCategory }) ;
        
    } catch (error) {
        
    }
}

const addCategory = async (req,res) => {
    try {
        const {productCategory} = req.body ;

        // first check the category is already present or not
        const isCategoryPresent = await Category.findOne({name:productCategory}) ;

        if(isCategoryPresent){
            res.redirect('/admin/category/view') ;
            throw new Error ('Product category is already exist') ;
        }
        
        //    creating a new document
        const newCategory = new Category ({
            name : productCategory
        })
        await newCategory.save() ;

        res.redirect('/admin/category/view') ;


    } catch (err) {
        console.log('something went wrong',err.message) ;
    }
}

const deleteCategory = async (req,res) => {
    res.send('hey you are category delete page')
}

const deleteProduct = async (req,res) => {
    try {
        const {productId} = req.params ;
       
        // delete the product
        await Products.deleteOne({ _id : productId }) ;
        
        res.json({
            productDelete : true
        })
    } catch (error) {
        console.log('Something went wrong...!')
    }

}

const getEditPage = async (req,res) => {
    try {

        const {productId}  = req.params ; 
        const product = await Products
                                    .findById(productId) 
                                    .populate('category') ;

        const categories = await Category
                                .find({})     
                                
                                
        
        res.render('admin/productEdit' , {categories,product} ) ;
    } catch (err) {
        
    }
} 

const updateProduct = async (req,res) => {
    try {

        
        const {productId} = req.params  ;

        const isValidProduct = productValidator(req.body) ;
        console.log(isValidProduct)
        if(!isValidProduct.isValid){
            throw new Error(isValidProduct.errors) ;
        }
        
        const { name , category , price , description , quantity , size , colour } = req.body ;

        const updatedCategory = await Category.findOne({ name : category });

        if(!updatedCategory) {
            throw new Error('invalid category name') ;
        }

        const imagePath = req.file.filename ;

        if(!imagePath){
            throw new Error('upload product Image') ;
        }
        
        let {isFeatured} = req.body ;
        if(isFeatured === 'on') {
        isFeatured = true
        }

        // updating the product
        await Products.updateOne({ _id : productId },{ $set : {
            name ,
            category : updatedCategory ,
            price ,
            description ,
            quantity ,
            size ,
            colour ,
            image : imagePath ,
            isFeatured 
        } })

        res.redirect('/admin/products/view') ;


    
    } catch (err) {
        console.log(err.message)
    }
        
}

const getTables = async (req,res) => {
    res.render('admin/pages/tables/basic-table')
}

const getCharts = async (req,res) => {
    res.render('admin/pages/charts/chartjs')
}

// create coupen
const createCoupon = async (req,res) => {
    try {
        const {coupenCode,startDate,expiry,discount} = req.body ;

        // creating new instance for Coupen
        const coupon = new Coupen({
            code : coupenCode,
            startDate,
            expiry,
            discount
        })

        await coupon.save() ;

        console.log(coupon) ;

    } catch (err) {
        
    }
}

// get all coupons
const getCoupons = async (req,res) => {
    try {
        const coupons = await Coupen.find({}) ;
        res.send(coupons) ;
    } catch (err) {
        
    }
}

module.exports = {getDashboard,
                  getProducts ,
                  getAddProduct ,
                  addProduct,
                  getCategory,
                  addCategory ,
                  deleteCategory ,
                  deleteProduct,
                  getEditPage,
                  updateProduct,
                  getTables,
                  getCharts,
                  getLogin,
                  login ,
                  createCoupon,
                  getCoupons,
                  logout
                  
                } 