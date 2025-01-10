const express = require('express') ;
const adminRouter = express() ;

const adminController = require('../controller/adminController') ;

const {adminAuth} = require('../middlewares/adminAuth') ;
const {imageUpload} = require('../middlewares/upload')


// admin GET loginPage
adminRouter.get('/admin/login' ,adminController.getLogin ) ;

// post login details 
adminRouter.post('/admin/login',adminController.login ) ;

// admin logout
adminRouter.get('/admin/logout' , adminController.logout )

adminRouter.get('/admin', adminAuth ,  adminController.getDashboard ) ;

// view all products
adminRouter.get('/admin/products/view', adminAuth , adminController.getProducts ) ;

// get addProduct page
adminRouter.get('/admin/product/add', adminAuth , adminController.getAddProduct ) ;

// post added products
adminRouter.post('/admin/addProduct' ,adminAuth , imageUpload ,adminController.addProduct ) ;

// delete product
adminRouter.delete('/admin/product/delete/:productId' , adminAuth , adminController.deleteProduct )

// get admin category page
adminRouter.get('/admin/category/view', adminAuth , adminController.getCategory ) ;

// add new category
adminRouter.post('/admin/addCategory', adminAuth ,adminController.addCategory) ;

// delete category
adminRouter.delete('/admin/deleteCategory', adminAuth ,adminController.deleteCategory ) ;

// GET product edit page
adminRouter.get('/admin/product/edit/:productId', adminAuth ,adminController.getEditPage ) ;

// post updated product data
adminRouter.post('/admin/product/edit/:productId', adminAuth  , adminController.updateProduct )

// GET form elements
adminRouter.get('/admin/tables', adminAuth , adminController.getTables ) ;

// get charts
adminRouter.get('/admin/charts', adminAuth ,adminController.getCharts ) ;

// get create coupon page
adminRouter.get('/admin/coupon/create',adminAuth,adminController.getCreateCoupon )

// create a coupen
adminRouter.post('/admin/coupon/create', adminAuth ,adminController.createCoupon ) ;

// get all coupens
adminRouter.get('/admin/coupon/view', adminAuth ,adminController.getCoupons ) ;

// get coupon edit page
adminRouter.get('/admin/coupon/edit/:couponId',adminAuth,adminController.getCouponEdit ) ;

// post updated coupon details
adminRouter.post('/admin/coupon/edit/:couponId',adminAuth,adminController.updateCoupon ) ;

// delete coupon
adminRouter.delete('/admin/coupon/delete/:couponId',adminAuth,adminController.deleteCoupon ) ;

// get user list 
adminRouter.get('/admin/user/view',adminAuth,adminController.getUsers ) ;

// block user
adminRouter.post('/admin/user/block/:userId',adminAuth, adminController.blockUser )



module.exports = {adminRouter}