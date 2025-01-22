const express = require('express') ;
const adminRouter = express() ;

const adminController = require('../controller/adminController') ;

const {adminAuth} = require('../middlewares/adminAuth') ;
const {upload} = require('../middlewares/upload')


// admin GET loginPage
adminRouter.get('/admin/login' ,adminController.getLogin ) ;

// post login details 
adminRouter.post('/admin/login',adminController.login ) ;

// admin logout
adminRouter.get('/admin/logout' , adminController.logout )

// get dashboard
adminRouter.get('/admin', adminAuth ,  adminController.getDashboard ) ;

// change time duration
adminRouter.post('/admin/sales-chart',adminAuth, adminController.salesChart ) ;

// view all products
adminRouter.get('/admin/products/view', adminAuth , adminController.getProducts ) ;

// get addProduct page
adminRouter.get('/admin/product/add', adminAuth , adminController.getAddProduct ) ;

// post added products
adminRouter.post('/admin/addProduct' ,adminAuth , upload.array('images',3) ,adminController.addProduct ) ;

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
adminRouter.post('/admin/user/block/:userId',adminAuth, adminController.blockUser ) ;

// view banners
adminRouter.get('/admin/banner/view',adminAuth,adminController.getBanners ) ;

// get banner create page
adminRouter.get('/admin/banner/create',adminAuth,adminController.getBannerCreate ) ;

// post entered banner data
adminRouter.post('/admin/banner/create',adminAuth , upload.single('bannerImage') ,adminController.addBanner ) ;

// get banner edit page
adminRouter.get('/admin/banner/edit/:bannerId',adminAuth,adminController.getBannerEdit ) ;

// edit banner
adminRouter.post('/admin/banner/edit/:bannerId',adminAuth,  upload.single('bannerImage')  , adminController.editBanner ) ;

// delete Banner
adminRouter.delete('/admin/banner/delete/:bannerId',adminAuth,adminController.deleteBanner ) ;

// get orders
adminRouter.get('/admin/order/view',adminAuth,adminController.getOrders ) ; 

// update order status
adminRouter.patch('/admin/order/change-status/:orderId',adminAuth,adminController.changeOrderStatus ) ;

// for view return requests
adminRouter.get('/admin/return-request/review',adminAuth, adminController.getReturnRequests ) ;

// review return requests
adminRouter.patch('/admin/return-request/review',adminAuth,adminController.reviewRequest ) ;

// get About 
adminRouter.get('/admin/about/view',adminAuth,adminController.getAboutPage ) ;

// get page for create about 
adminRouter.get('/admin/about/create',adminAuth,adminController.getAboutAdd ) ;

// create new About
adminRouter.post('/admin/about/create',adminAuth , upload.single('aboutImage'),adminController.createAbout ) ;

// delete about
adminRouter.delete('/admin/about/delete/:aboutId',adminAuth,adminController.deleteAbout) ;

// get edit about
adminRouter.get('/admin/about/edit/:aboutId',adminAuth,adminController.getAboutEdit ) ;

// edit about
adminRouter.post('/admin/about/edit/:aboutId',adminAuth,upload.single('aboutImage'),adminController.editAbout) ;

 

module.exports = {adminRouter}