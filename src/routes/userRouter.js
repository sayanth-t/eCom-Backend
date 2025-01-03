const express = require('express') ;
const userRouter = express() ;

const multer = require('multer') ;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/users-images') ;
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname ;
      cb(null, file.fieldname + '-' + uniqueSuffix) ;
    }
  })
  
  const upload = multer({ storage: storage })

const {userAuth} = require('../middlewares/userAuth')

const userController = require('../controller/userController') ;

userRouter.get('/', userController.getHome ) ;

// get user profile
userRouter.get('/profile/view', userAuth ,userController.getProfile )

// get profileEdit page
userRouter.get('/profile/edit',userAuth , userController.getProfileEdit ) ;

// get profileEdit page
userRouter.post('/profile/edit',userAuth ,  upload.single('userProfile')  , userController.editProfile ) ;

// get user login page
userRouter.get('/login',userController.getLogin ) ;

// get email id entering page for reset password
userRouter.get('/passwordRecovery',userController.getEmailEnter ) ;

// verify entered email 
userRouter.post('/emailVerfiry',userController.forgottPassword ) ;

// after email url link
userRouter.get('/resetPassword/:passwordReset',userController.getResetPassword ) ;

// post resetted password
userRouter.post('/resetPassword/:userId',userController.resetPassword )

// logout
userRouter.post('/logout',userAuth,userController.logout) ;

// get product page
userRouter.get('/products', userController.getProduct ) ;

// get signup page
userRouter.get('/signup' ,userController.getSignup ) ;

// post signup data
userRouter.post('/signup' , userController.signup ) ;

// post verify OTP 
userRouter.post('/verify-otp/:userId',userController.verifyOtp) ;

// get Login page
userRouter.get('/login', userController.getLogin ) ;

// post Login
userRouter.post('/login', userController.login ) ;

// get wishlist
userRouter.get('/wishlist',userAuth,userController.getWishlist )

// add to wishlist
userRouter.post('/wishlist/:productId',userAuth,userController.addtoWishlist ) ;

// get Cart
userRouter.get('/cart' , userAuth ,userController.getCart ) ;

// product add to cart
userRouter.post('/cart/:productId' , userAuth , userController.addToCart ) ;

// remove product from cart
userRouter.post('/cart/removeProduct/:cartItemId' , userAuth , userController.removeProduct ) ;

// change cart product quantity
userRouter.patch('/cart/changeQuantity', userAuth , userController.changeCartCount ) ;

// cart products checkout
userRouter.post('/placeOrder',userAuth, userController.placeOrder ) ;

// get orders 
userRouter.get('/orders',userAuth , userController.getOrders ) ;

// verify payment
userRouter.post('/verify-payment',userAuth,userController.verifyPayment )




module.exports = {userRouter} ;