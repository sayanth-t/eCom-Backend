const Products = require('../models/products') ;

const Category = require('../models/category') ;


const {productValidator} = require('../utils/productValidator') ;

const getAdminPanel = async (req,res) =>{
    res.render('admin/dashboard') ;
}

const getProducts = async (req,res) => {
    // find all products
    const products = await Products
                                .find({})
                                .populate('category') ;

    console.log('hey you are in product page') ;
    res.render('admin/allProducts',{products}) ;
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

        console.log(category)

        let {isFeatured} = req.body ;

        if(isFeatured === 'on') {
            isFeatured = true
        }

        // find the entered category from categoy collection
        const productCategory = await Category.findOne({name:category}) ;

        console.log(productCategory) ;

        if(!productCategory){
            throw new Error ('category is not found') ;
        }

        const imagePath = req.file.filename ;

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
            isFeatured
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
        res.redirect('/admin/products/view') ;

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

const getLogin = async (req,res) => {
    res.render('admin/pages/samples/login')
}

module.exports = {getAdminPanel,
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
                  getLogin
                  
                } 