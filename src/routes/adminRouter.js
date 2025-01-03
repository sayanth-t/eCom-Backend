const express = require('express') ;
const adminRouter = express() ;


const multer  = require('multer') ;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/product-images') ;
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname ;
      cb(null, file.fieldname + '-' + uniqueSuffix) ;
    }
  })
  
  const upload = multer({ storage: storage })

const adminController = require('../controller/adminController') ;

adminRouter.get('/admin', adminController.getAdminPanel ) ;

// view all products
adminRouter.get('/admin/products/view', adminController.getProducts ) ;

// get addProduct page
adminRouter.get('/admin/product/add', adminController.getAddProduct ) ;

// post added products
adminRouter.post('/admin/addProduct' , upload.single('image') ,adminController.addProduct ) ;

// get admin category page
adminRouter.get('/admin/category/view', adminController.getCategory ) ;

// add new category
adminRouter.post('/admin/addCategory',adminController.addCategory) ;

// delete category
adminRouter.delete('/admin/deleteCategory',adminController.deleteCategory ) ;

// delete product
adminRouter.post('/admin/product/delete/:productId' , adminController.deleteProduct ) ;

// GET product edit page
adminRouter.get('/admin/product/edit/:productId',adminController.getEditPage ) ;

// post updated product data
adminRouter.post('/admin/product/edit/:productId' , upload.single('image')  , adminController.updateProduct )

// GET form elements
adminRouter.get('/admin/tables', adminController.getTables ) ;

// get charts
adminRouter.get('/admin/charts',adminController.getCharts ) ;

// admin GET loginPage
adminRouter.get('/admin/login',adminController.getLogin ) ;

module.exports = {adminRouter}