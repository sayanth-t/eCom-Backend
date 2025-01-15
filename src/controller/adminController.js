const Products = require('../models/products') ;
const Category = require('../models/category') ;
const Coupon = require('../models/coupon') ;
const Admin = require('../models/admin') ;
const Users = require('../models/users') ;
const Banner = require('../models/banner') ;

const bcrypt = require('bcrypt') ;
const jwt = require('jsonwebtoken') ;

const {productValidator} = require('../utils/productValidator') ;
const Orders = require('../models/orders');
const { success } = require('toastr') ;

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

    let oneWeekAgo = new Date() ;
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get the date 7 days ago
    

    // for find total orders in last week
    const ordersCount = await Orders.aggregate([
        { $match : { date : { $gte : oneWeekAgo }}},
        { $group : { _id : null  ,
            totalOrders : { $sum : 1 }
        }}
    ])
    const lasteWeekOrderCount = ordersCount[0].totalOrders ;

    // for finding total revanue
    const revenue = await Orders.aggregate([
        { $match : { date : { $gte : oneWeekAgo }}},
        { $group : { _id : null  ,
            totalRevenue : { $sum : "$totalAmount" }
        }}
    ])
    const lastWeekRevenue = revenue[0].totalRevenue ;

    // for creating chart
    const ordersPerDay = await Orders.aggregate([
        { $match : { date : { $gte : oneWeekAgo }}},
        { $group : { _id : { $dateToString: { format: "%Y-%m-%d", date: "$date" } } , 
            totalSales : { $sum : 1 }
        }},
        { $sort : { _id : 1 }}
    ])

    // for comparing change to y-m-d format of last week days
    const dateRange = (startDate) => {
        const dateRange = [];
        let currentDate = new Date(startDate);
        for (let i = 1 ; i <= 7 ; i++) {
            
            currentDate.setDate(currentDate.getDate() + 1);
            const dateString = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            dateRange.push(dateString);

        }
        return dateRange;
    };
    
    const days = dateRange(oneWeekAgo) ;
    
    let lastWeekSales = [] ;
    let lastWeekDays = [] ;

    // for getting Y axis values
    days.forEach( day => {
        
        // check sales is done in that day
        const saleDone = ordersPerDay.find(sale=> sale._id === day) ;
        if(saleDone){
            lastWeekSales.push(saleDone.totalSales) ;
        }
        else{
            lastWeekSales.push(0) ;
        }

        const dayNumber = new Date(day).getDate() ;
        const monthNames = ["Jan", "Feb", "March", "April", "May", "June",
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];
        const month = monthNames[new Date(day).getMonth()] ; 

        lastWeekDays.push( month + ' ' +  dayNumber  ) ;
    })



    res.render('admin/dashboard',  { admin , lastWeekSales , lasteWeekOrderCount , lastWeekRevenue , lastWeekDays }) ;
   } catch (err) {
    console.log(err.message)
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
        const admin = req.admin ;
        const categories = await Category
                                .find({}) 
                                
        
        res.render('admin/addProduct' , {categories,admin} ) ;
        
       
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

        let imagePaths = [] ;
        req.files.forEach((file)=>{
            imagePaths.push(file.filename) ;
        })

        if( imagePaths.length === 0 ) {
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
            image : imagePaths,
           
        })

        // save new product object into products database
        const addedProduct =  await newProduct.save() ;

        console.log(addedProduct) ;
        console.log('product is added successfully')
 
        res.redirect('/admin/products/view') ;

    } catch (err) {
       
        res.json({
            err : true ,
            message : err.message
        })
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

        res.render('admin/editProduct' , {categories,product} ) ;
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

        console.log(req.body) ;

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

// get create coupon page
const getCreateCoupon = async (req,res) => {
    try {
        const admin = req.admin ;
        res.render('admin/addCoupon',{admin})
    } catch (err) {
        
    }
}

// create coupen
const createCoupon = async (req,res) => {
    try {
        console.log('coupon is saving...') ;

        const {name,coupenCode,startDate,expiry,discount} = req.body ;

        console.log(coupenCode) ;

        // creating new instance for Coupen
        const coupon = new Coupon({
            name,
            code : coupenCode,
            startDate,
            expiry,
            discount
        })

        await coupon.save() ;

        console.log(coupon) ;

        res.redirect('/admin/coupon/view') ;

    } catch (err) {
        console.log(err.message) ;
    }
}

// get all coupons
const getCoupons = async (req,res) => {
    try {
        const admin = req.admin ;
        const coupons = await Coupon.find({}) ;
        res.render('admin/coupons',{admin,coupons}) ;
    } catch (err) {
        
    }
}

// get coupon edit page
const getCouponEdit = async (req,res) => {
    try {
        const {couponId} = req.params ;
        const coupon = await Coupon.findById(couponId) ;

        res.render('admin/editCoupon',{coupon}) ;
    } catch (err) {
        
    }
}

// update coupon
 const updateCoupon = async (req,res) => {
    try {
        const {couponId} = req.params ;
        
        console.log(req.body) ;

        const {name,couponCode,expiry,discount} = req.body ;

        // updataing coupon
        await Coupon.updateOne({_id:couponId},{$set:{
            name : name ,
            code : couponCode ,
            expiry : expiry ,
            discount : discount
        }})

        res.redirect('/admin/coupon/view') ;
    } catch (err) {
        console.log(err.message) ;
    }
 }

// get all users 
const getUsers = async (req,res) => {
    try {
        const admin = req.admin ;
        const users = await Users
                                .find({}, 'name emailId phoneNumber image address isBlocked')
                                .populate('address')
                                                       

        console.log(users) ;
        res.render('admin/users',{admin,users})  ;
    } catch (err) {
        console.log(err.message) ;
    }
}

// blaock or unblock user
const blockUser = async (req,res) => {
    try {
        
        const {userId} = req.params ;
        const user = await Users.findById(userId) ;

        if( user.isBlocked === true ) {
            // updating the user's isBlocked field 
            await Users.findByIdAndUpdate(userId,{isBlocked:false}) ;
            return res.json({
                unblocked : true
            })
        }
        else{
             // updating the user's isBlocked field 
             await Users.findByIdAndUpdate(userId,{isBlocked:true}) ;
             return res.json({
                blocked : true
            })
        }
        
        
    } catch (err) {
        
    }
}

// delete coupon
const deleteCoupon = async (req,res) => {
    try {
        const {couponId} = req.params ;
       
        // deleting the coupon 
        await Coupon.deleteOne({_id:couponId}) ;

        res.json({
            couponDelete : true 
        })

       
    } catch (err) {
        console.log(err.message) ;
        res.status(500).json({
            couponDelete: false,
            message: "Error deleting the coupon"
        });
    }
}

// get all banners
const getBanners = async (req,res) => {
    try {
        const admin = req.admin ;
        const banners = await Banner.find() ;
        res.render('admin/banners' ,{ admin , banners })
    } catch (err) {
        
    }
}

// get banner edit page
const getBannerCreate = async (req,res) => {
    try {
        const admin = req.admin ;
        
        res.render('admin/addBanner',{admin}) ;
    } catch (err) {
        
    }
}

// creating new banner
const addBanner = async (req,res) => {
    try {
       const {title,subTitle} = req.body ;
       const bannerImage = req.file.filename ;

       const banner = new Banner({
            title ,
            subTitle,
            image : bannerImage
       })
      
       await banner.save() ;
       res.redirect('/admin/banner/view') ;

    } catch (err) {
        
    }
}

// get baner edit page
const getBannerEdit = async (req,res) => {
    try {
        const {bannerId} = req.params ;
        const banner = await Banner.findById(bannerId) ;

        res.render('admin/editBanner',{banner}) ;
    } catch (err) {
        console.log(err.message) ;
    }
}

// edit banner
const editBanner = async (req,res) => {
    try {
        const {title,subTitle} = req.body ;
        const bannerImage = req.file.filename ;
        const {bannerId} = req.params ;

        // updating banner
        await Banner.findByIdAndUpdate(bannerId,{
            title,
            subTitle,
            image : bannerImage
        })

        res.redirect('/admin/banner/view') ;

    } catch (err) {
        
    }
}

// delete banner
const deleteBanner = async (req,res) => {
    try {
        
        const {bannerId} = req.params ;

        // deleting the banner
        await Banner.findByIdAndDelete(bannerId) ;
        res.json({
            bannerDelete : true
        })
    } catch (err) {
        console.log(err.message)
        res.json({
            bannerDelete : false
        })
    }
}

// get orders
const getOrders = async (req,res) => {
    try {
        const admin = req.admin ;
        const orders = await Orders.find()
                                   .populate('address',['country','state','address','city','pinNo','-_id'])
                                   .populate('userId')
                                   .populate('products')
                                   
        console.log(orders ) ;                           
        res.render('admin/orders',{orders,admin})
    } catch (err) {
        
    }
}

// to change order status 
const changeOrderStatus = async (req,res) => {
    try {
        const {orderId} = req.params ;
        const {status} = req.body ;
       
        // updating the order status 
        await Orders.findByIdAndUpdate(orderId,{ status }) ;

        res.json({
            statusChanged : true
        })

    } catch (err) {
        res.json({
            statusChanged : false
        })
    }
}

// change time duration 
const salesChart = async (req,res) => {
    try {
        const {startDate,endDate} = req.body ;

        const start = new Date(startDate) ;
        const end = new Date(endDate) ;

        if( start >= end ){
            throw new Error('enter proper date range') ;
        }
        // for find total orders in last week
        const ordersCount = await Orders.aggregate([
            { $match : { date : { $gte: start, $lte: end }}},
            { $group : { _id : null  ,
                totalOrders : { $sum : 1 }
            }}
        ])
        const orders = ordersCount[0].totalOrders ;

        // for finding total revanue
        const revenue = await Orders.aggregate([
            { $match : { date : { $gte: start, $lte: end }}},
            { $group : { _id : null  ,
                totalRevenue : { $sum : "$totalAmount" }
            }}
        ])
        const profit = revenue[0].totalRevenue ;
        
         // for creating chart
        const ordersPerDay = await Orders.aggregate([
            { $match : { date : { $gte: start, $lte: end } }},
            { $group : { _id : { $dateToString: { format: "%Y-%m-%d", date: "$date" } } , 
                totalSales : { $sum : 1 }
            }},
            { $sort : { _id : 1 }}
        ])
        
        // for comparing change to y-m-d format of last week days
        const dateRange = (start,end) => {
            const dateRange = [];

            const startDate = new Date(start) ;
            const endDate = new Date(end) ; 
            const dayDifference = ( endDate - startDate ) / (1000 * 60 * 60 * 24);

            if( dayDifference <= 0 ){
                throw new Error("Enter proper time duration ") ;
            }

            for (let i = 0 ; i <= dayDifference ; i++) {
                const currentDate = new Date(startDate)
                currentDate.setDate( currentDate.getDate() + i );
                const dateString = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                dateRange.push(dateString);
                
            }
            return dateRange;
        };
        
        const days = dateRange(startDate,endDate) ;
        
        let sales = [] ;
        let dayDuration = [] ;

        // for getting Y and X axis values
        days.forEach( day => {
            
            // check sales is done in that day
            const saleDone = ordersPerDay.find(sale=> sale._id === day) ;
            if(saleDone){
                sales.push(saleDone.totalSales) ;
            }
            else{
                sales.push(0) ;
            }

            const dayNumber = new Date(day).getDate() ;
            const monthNames = ["Jan", "Feb", "March", "April", "May", "June",
                "July", "Aug", "Sept", "Oct", "Nov", "Dec"
            ];
            const month = monthNames[new Date(day).getMonth()] ; 

            dayDuration.push( month + ' ' +  dayNumber ) ;
        })

        console.log('sales : ',sales) ;
        console.log('days : ',dayDuration) ;

        res.json({
            changeDays : true ,
            sales , 
            dayDuration,
            orders,
            profit,
            startDate,
            endDate
        })

       
    } catch (err) {
        res.status(400).json({
            message : err.message
        })
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
                  logout,
                  getCreateCoupon,
                  getUsers,
                  getCouponEdit ,
                  updateCoupon ,
                  deleteCoupon,
                  blockUser ,
                  getBanners ,
                  getBannerCreate ,
                  addBanner,
                  getBannerEdit,
                  editBanner,
                  deleteBanner,
                  getOrders,
                  changeOrderStatus,
                  salesChart
                } 