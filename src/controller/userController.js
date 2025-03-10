const Products = require('../models/products');
const Users = require('../models/users');
const UserVerification = require('../models/userVerification');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Address = require('../models/address');
const Orders = require('../models/orders');
const Wishlist = require('../models/wishlist');
const Coupon = require('../models/coupon');
const Category = require('../models/category');
const { ObjectId } = require('mongoose').Types;
const Banner = require('../models/banner');
const Return = require('../models/return');
const Wallet = require('../models/wallet');
const About = require('../models/about') ;
const Contact = require('../models/contact') ;

const crypto = require('crypto');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getCartCount } = require('../utils/getCartCount');
const { userValidator } = require('../utils/userValidation');
const { addressValidator } = require('../utils/addressValidation');
const { isLogged } = require('../utils/isLogged');
const { getOrderCount } = require('../utils/getOrderCount');
const { getWishlistCount } = require('../utils/getWishlistCount');

const Mailgen = require('mailgen');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

// razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id : process.env.KEY_ID ,
  key_secret : process.env.SECRET_KEY,
});

const {
  validatePaymentVerification,
  validateWebhookSignature,
} = require('../../node_modules/razorpay/dist/utils/razorpay-utils');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const { default: mongoose } = require('mongoose');

const getHome = async (req, res) => {
  try {

    const limit = req.query.limit * 1 || 3 ;

    const products = await Products.find({}).populate('category').limit(limit);

    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    if (req.xhr) {
      return res.json({
        products,
      });
    }
    const banners = await Banner.find();

    res.render('user/home', {
      products,
      cartProductCount,
      isUserLoggedin,
      orderCount,
      wishlistProductCount,
      banners,
    });
  } catch (err) {
    console.log('error while getting home page', err.message );
  }
};

// get user Profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    console.log(user)

    const cartProductCount = await getCartCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    const wallet = await Wallet.findOne( { userId: user._id } );

    let transactions = [] ;
    if(wallet) {
      // finding latest three transctions
      transactions = wallet.transactions ;
    }

    res.render('user/profilePage', {
      user,
      cartProductCount,
      isUserLoggedin,
      wallet,
      transactions,
      wishlistProductCount,
    });
  } catch (err) {
    console.log(err.message)
  }
};

// get profile edit page
const getProfileEdit = async (req, res) => {
  try {
    const isUserLoggedin = await isLogged(req.cookies);
    const cartProductCount = await getCartCount(req.cookies);
    const user = req.user;

    res.render('user/profileEdit', { cartProductCount, user, isUserLoggedin });
  } catch (error) {}
};

// post edited user profile
const editProfile = async (req, res) => {
  try {
    console.log('hey from user profile edite page..!');
    const user = req.user;
    const { name, emailId, phoneNumber, address } = req.body;

    const userProfile = req.file.filename;

    // updating the user profile
    await Users.updateOne(
      { _id: user._id },
      { $set: { name, emailId, phoneNumber, image: userProfile } }
    );
    res.redirect('/profile/view');
  } catch (err) {
    console.log(err.message);
  }
};

// logout
const logout = async (req, res) => {
  try {
    res.clearCookie('token');

    res.redirect('/');
  } catch (err) {
    console.log(err.message);
  }
};

// get login page
const getLogin = async (req, res) => {
  try {
    const cartProductCount = await getCartCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    res.render('user/login', { cartProductCount, isUserLoggedin });
  } catch (error) {}
};

// get email entering page for reset password
const getEmailEnter = async (req, res) => {
  try {
    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    res.render('user/emailEnter', {
      cartProductCount,
      orderCount,
      isUserLoggedin,
    });
  } catch (err) {
    console.log('err.message');
  }
};

const forgottPassword = async (req, res) => {
  try {
    const { emailId } = req.body;

    // chack the email id is valid or not
    const user = await Users.findOne({ emailId });
    if (!user) {
      throw new Error('user is not found with entered email Id');
    }

    // generate a randon reset token
    const resetPasswordToken = user.createResetPasswordToken();

    await user.save();

    // creating transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        // Appears in header & footer of e-mails
        name: 'Thrayi',
        link: 'https://mailgen.js/',
      },
    });

    // creating url for reset password
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetPasswordToken}`;

    const email = {
      body: {
        name: `${user.name}`,
        intro: 'we have recieved a password reset request',
        // Add the verification code section
        instructions: 'please use the below link to reset you password',
        action: {
          button: {
            color: 'green',
            text: 'reset password',
            link: resetUrl,
          },
        },
        outro: 'the password reset token will expire in 10 minutes !',
      },
    };
    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(email);

    const info = await transporter.sendMail({
      from: process.env.AUTH_EMAIL, // sender address
      to: emailId, // list of receivers
      subject: 'password reset', // Subject line
      html: emailBody, // html body
    });

    console.log('reset password token was sent ');
  } catch (err) {
    console.log(err.message);
  }
};

// for showing page for reset password
const getResetPassword = async (req, res) => {
  try {
    const { passwordReset } = req.params ;
    // converting plane token to hash
    const token = crypto
      .createHash('sha256')
      .update(passwordReset)
      .digest('hex');

    // find the user with password reset token
    const user = await Users.findOne({ passwordResetToken: token });
    console.log(user);

    if (!user) {
      throw new Error('invalid user');
    }

    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);

    res.render('user/resetPassword', {
      cartProductCount,
      orderCount,
      isUserLoggedin,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

// reset password
const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    // find user with userId
    const user = await Users.findById(userId);
    if (!user) {
      throw new Error('invalid user');
    }

    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    // updaing the user with new password
    Users.updateOne({ _id: userId }, { $set: { password: passwordHash } });

    res.redirect('/login');
  } catch (err) {}
};

// get signup page
const getSignup = async (req, res) => {
  try {
    const isUserLoggedin = await isLogged(req.cookies);
    const cartProductCount = await getCartCount(req.cookies);
    res.render('user/signup', { cartProductCount, isUserLoggedin });
  } catch (err) {
    console.log(err.message);
  }
};

// get product page
const getProduct = async (req, res) => {
  try {
    const limit = parseInt( req.query.limit ) || 3 ;
    console.log('limit value : --',limit) ;
    
    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);
    const products = await Products
                                  .find({})
                                  .populate('category')
                                  .limit(limit)

    if (req.xhr) {
      return res.json({
        products
      });
    }                              

    res.render('user/allProducts', {
      products,
      cartProductCount,
      isUserLoggedin,
      orderCount,
      wishlistProductCount,
    });
  } catch (err) {}
};

// post data from signup
const signup = async (req, res) => {
  try {
    const { name, emailId, phoneNumber, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new Error('passwords are not match');
    }

    const validateUser = userValidator(req.body);
    // check if there is any error
    if ((await validateUser).isValid === false) {
      throw new Error((await validateUser).errors);
    }

    // hash the user entered password
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('hashed Password : ', passwordHash);

    // create new instance for User collection
    const user = new Users({
      name,
      emailId,
      phoneNumber,
      password: passwordHash,
    });

    await user.save();

    // creating transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });
    // Configure mailgen by setting a theme and your product info
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        // Appears in header & footer of e-mails
        name: 'Thrayi',
        link: 'https://mailgen.js/',
      },
    });

    // OTP generator function
    const generateOtp = function generateOTP() {
      return speakeasy.totp({
        secret: 'secret_key', // Use a secure key in production
        encoding: 'base32',
      });
    };

    const otp = generateOtp();
    console.log('generated verification code :', otp);

    const email = {
      body: {
        name: `${name}`,
        intro: "Welcome to Thrayi We're very excited to have you on board.",
        // Add the verification code section
        instructions:
          'Please use the following verification code to complete your registration:',
        action: {
          button: {
            text: `Your Verification Code: ${otp}`, // Display the code as a button text
            color: '#22BC66', // Optional button color
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    // Generate an HTML email with the provided contents
    const emailBody = mailGenerator.generate(email);

    const info = await transporter.sendMail({
      from: process.env.AUTH_EMAIL, // sender address
      to: emailId, // list of receivers
      subject: 'Verification Code', // Subject line
      html: emailBody, // html body
    });

    console.log('Message sent: ', info.messageId);

    const savedUser = await Users.findOne({ emailId });

    const userVerification = new UserVerification({
      userId: savedUser._id,
      verificationCode: otp,
      createdAt: Date.now(),
      expireAt:
        Date.now() +
        10 *
          60 *
          1000 /* after 10 minute userVerification object will delete automatically */,
    });

    await userVerification.save();

    res.json({
      signup: true,
      userId: savedUser._id,
    });

    // res.render('user/otpVerification', { userId : savedUser._id , cartProductCount , orderCount , isUserLoggedin }) ;
  } catch (err) {
    console.log(err.message);
    res.json({
      signupError: true,
      message: err.message,
    });
  }
};

// get otp entering page
const getVerifyPage = async (req, res) => {
  try {
    const { userId } = req.params;
    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);

    res.render('user/otpVerification', {
      userId,
      cartProductCount,
      orderCount,
      isUserLoggedin,
    });
  } catch (err) {}
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { userId } = req.params;

    const user = await Users.findById(userId);

    const userVerification = await UserVerification.findOne({ userId });

    if (otp !== userVerification.verificationCode) {
      throw new Error('invalid OTP');
    }

    if (!userVerification) {
      throw new Error('OTP validity expired!');
    }

    // changing the user isVerified field to true
    user.isVerified = true;

    await user.save();

    res.json({
      verfiyOtp: true,
    });
    // res.redirect('/login') ;
  } catch (err) {
    console.log('something went wrong!', err.message);
    res.json({
      verfiyOtp: false,
      message: err.message,
    });
  }
};

// post login data
const login = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      await jwt.verify(token, process.env.JWT_PRIVATEKEY);
      return res.redirect('/');
    }

    const { emailId, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      throw new Error('passwords do not match');
    }
    console.log(req.body);

    // checking with the entered emailId
    const user = await Users.findOne({ emailId });
    if (!user) {
      throw new Error('invalid credentials');
    }

    if (user.isVerified === false) {
      throw new Error('user is not verified!');
    }

    if (user.isBlocked === true) {
      throw new Error('user is blocked!');
    }

    // checking the entered password match to hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new Error('invalid password');
    }

    // creating jwt token
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_PRIVATEKEY,
      { expiresIn: '1d' }
    );

    // sending the token to client through cookies
    res.cookie('token', jwtToken);

    res.json({
      status: true,
    });
  } catch (err) {
    console.log(err.message);
    res.json({
      loginError: true,
      message: err.message,
    });
  }
};

// add to wishlist
const addtoWishlist = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.params;
    const product = await Products.findById(productId);

    // product id convert into string
    productIdString = productId.toString();

    if (!product) {
      throw new Error('invalid product');
    }

    // if the user already have a wishlist
    const userWishlist = await Wishlist.findOne({ userId: user._id });

    if (userWishlist) {
      // if the product already exist
      const alreadyAdded = userWishlist.product.find(
        (id) => id.toString() === productId
      );

      if (alreadyAdded) {
        // remove the element
        await Wishlist.findOneAndUpdate(
          { userId: user._id },
          { $pull: { product: productId } }
        );

        // find wishlist product count
        const wishlist = await Wishlist.findOne({ userId: user._id });

        res.json({
          status: false,
          wishlistCount: wishlist.product.length || 0,
        });
      } else {
        userWishlist.product.push(productId);
        await userWishlist.save();
        res.send({
          status: true,
          wishlistCount: userWishlist.product.length || 0,
        });
      }
    } else {
      // if the user have no wishlist
      const wishlist = new Wishlist({
        userId: user._id,
        product: [productIdString],
      });

      await wishlist.save();

      res.json({
        status: true,
        wishlistCount: wishlist.product.length || 0,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

// get wish list
const getWishlist = async (req, res) => {
  try {
    const user = req.user;

    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    // find user wishlist
    const wishlist = await Wishlist.findOne({ userId: user._id }).populate(
      'product'
    );

    if (!wishlist || wishlist.product.length === 0) {
      return res.json({
        wishlistEmpty: true,
      });
    }

    res.render('user/wishlist', {
      wishlist,
      cartProductCount,
      orderCount,
      isUserLoggedin,
      wishlistProductCount,
    });
  } catch (err) {
    console.log(err.message);
  }
};

// get cart page
const getCart = async (req, res) => {
  try {
    const cartProductCount = await getCartCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id }).populate('products');

    const userAddress = await Address.findOne({ userId: user._id });
    console.log(userAddress);

    // if the cart is not present
    if (!cart || cart.products.length === 0) {
      return res.json({
        cartEmpty: true,
      });
    }

    res.render('user/shoping-cart', {
      cart,
      cartProductCount,
      userAddress,
      isUserLoggedin,
      wishlistProductCount,
    });
  } catch (err) {
    console.log(err.message);
    res.redirect('/login');
  }
};

// product add to cart
const addToCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.params;
    const { size, colour, buyQuantity } = req.body;


    // finding the product
    const product = await Products.findById(productId);

    // check the user has already a cart
    const userCart = await Cart.findOne({ user: user._id });

    // check the cartitem already exist
    const userCartItem = await CartItem.findOne({
      user: user._id,
      productId,
      size,
      colour,
      price: product.price,
    });

    let cartCount;

    if (userCart) {
      if (userCartItem) {
        userCartItem.quantity += Number(buyQuantity);
        userCartItem.total += userCartItem.price * Number(buyQuantity);

        await userCartItem.save();

        userCart.total += userCartItem.price * Number(buyQuantity);
        await userCart.save();

        cartCount = userCart.products.length;

        makeAlert();
      } else {
        // creating cart item
        const cartItem = new CartItem({
          user: user._id,
          productId,
          name: product.name,
          image: product.image,
          size,
          colour,
          quantity: buyQuantity,
          price: product.price,
          total: product.price * buyQuantity,
        });

        await cartItem.save();

        // push new cartItem id to existing user cart
        userCart.products.push(cartItem._id);
        userCart.total += cartItem.total;
        userCart.save();

        cartCount = userCart.products.length;

        makeAlert();
      }
    } else {
      // creating cart item
      const cartItem = new CartItem({
        user: user._id,
        productId,
        name: product.name,
        image: product.image,
        size,
        colour,
        quantity: buyQuantity,
        price: product.price,
        total: product.price * buyQuantity,
      });

      await cartItem.save();

      // creating a cartId
      const cartId = new ObjectId().toString();

      const cart = new Cart({
        user: user._id,
        cartId,
        products: [cartItem._id],
        total: cartItem.total,
      });

      await cart.save();

      cartCount = cart.products.length;

      // calling the alert function()
      makeAlert();
    }

    // function for data send back to client side when cart is saved
    function makeAlert() {
      res.json({
        status: true,
        cartCount,
      });
    }

    // res.redirect('/cart')
  } catch (err) {
    console.log('something went wrong when add to cart', err.message);
  }
};

// remove product from cart
const removeProduct = async (req, res) => {
  try {
    const user = req.user;
    const { cartItemId } = req.params;

    const cartItem = await CartItem.findById(cartItemId);

    const cart = await Cart.findOne({ user: user._id });
    const cartItemIndex = cart.products.findIndex(
      (cartItem) => cartItem._id.toString() === cartItemId
    );

    // removing cart item from cart
    cart.products.splice(cartItemIndex, 1);

    // find the cart total
    cart.total = cart.total - cartItem.total;

    // deleting the cart item also
    await CartItem.deleteOne({ _id: cartItemId });

    // check the Cart products is empty or not
    if (cart.products.length === 0) {
      await Cart.deleteOne({ user: user._id });
      return res.redirect('/');
    } else {
      await cart.save();
    }

    res.redirect('/cart');
  } catch (err) {
    console.log(err.message);
  }
};

// change product cart count
const changeCartCount = async (req, res) => {
  try {
    const user = req.user;
    const { cartItemId, cartId, count } = req.body;

    // find cart
    const cart = await Cart.findOne({ user: user._id });

    // find the cart item
    const cartItem = await CartItem.findById(cartItemId);

    if (Number(count) === -1) {
      cartItem.quantity += Number(count);
      cartItem.total = cartItem.total - cartItem.price;
    } else {
      cartItem.quantity += Number(count);
      cartItem.total = cartItem.total + cartItem.price;
    }

    await cartItem.save();

    const cartTotalArray = await CartItem.aggregate([
      { $match: { user: user._id, isPlaced: false } },
      { $group: { _id: null, cartTotal: { $sum: '$total' } } },
    ]);

    const { cartTotal } = cartTotalArray[0];

    console.log(cartTotal);

    cart.total = cartTotal;
    await cart.save();

    res.json({
      success: true,
      cartItem: {
        id: cartItemId,
        quantity: cartItem.quantity,
        total: cartItem.total,
      },
      cartTotal,
    });
  } catch (err) {
    console.log(err.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const user = req.user;

    const { payingMethod, country, state, address, city, postcode } = req.body;

    const { isValid, errors } = addressValidator(req.body);

    if (!isValid) {
      throw new Error(errors) ;
    }

    const cart = await Cart.findOne({ user: user._id });

    let paymentMethod;
    let status;

    // check if the payment if cod or online payment
    if (payingMethod === 'CASH ON DELIVERY') {
      paymentMethod = 'cod';
      status = 'placed';
    } else {
      paymentMethod = 'onlinePayment';
      status = 'pending';
    }

    if (!user.address) {
      // creating address document for user
      const userAddress = new Address({
        userId: user._id,
        country: country,
        state: state,
        address: address,
        city: city,
        pinNo: postcode,
      });
      await userAddress.save();

      user.address = userAddress._id;
      await user.save();
    } else {
      // updating the user address
      await Address.findOneAndUpdate(
        { userId: user._id },
        {
          country: country,
          state: state,
          address: address,
          city: city,
          pinNo: postcode,
        }
      );
    }

    const userAddress = await Address.findOne({ userId: user._id });

    const orderId = new ObjectId();
    // creating order model
    const userOrder = new Orders({
      userId: user._id,
      orderId,
      address: userAddress._id,
      products: cart.products,
      totalAmount: cart.total,
      paymentMethod: paymentMethod,
      status: status,
      date: new Date(),
    });

    await userOrder.save();

    if (userOrder.status === 'placed') {
      // if order placed remove the cart
      await Cart.deleteOne({ user: user._id });

      //  changing cart item isPlaced field
      await CartItem.updateMany({ user: user._id }, { isPlaced: true });

      res.json({
        codPayment: true,
      });
    } else {
      // creating razorpay order
      const razorpayOrder = {
        amount: userOrder.totalAmount * 100,
        currency: 'INR',
        receipt: orderId,
      };

      razorpay.orders.create(razorpayOrder, function (err, order) {
        console.log(order);
        res.json({
          onlinePayment: true,
          order: order,
          user: user,
        });
      });
    }
  } catch (err) {
    res.json({
      addressError: true,
      message: err.message,
    });
    console.log(err.message);
  }
};

// get order list
const getOrders = async (req, res) => {
  try {
    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    const user = req.user;

    const orders = await Orders.find({ userId: user._id })
      .populate('products')
      .populate('address');

    if (orders.length === 0) {
      throw new Error('order list is empty');
    }

    orders.forEach((order) => {
      console.log(order);
    });

    res.render('user/orderDetails', {
      orders,
      user,
      cartProductCount,
      orderCount,
      isUserLoggedin,
      wishlistProductCount
    });
  } catch (err) {
    console.log(err.message);
    res.json({
      emptyOrder: true,
    });
  }
};

// verify payment
const verifyPayment = async (req, res) => {
  try {
    console.log('verifyyyyinnngggg');
    const { payment, order } = req.body;

    const user = req.user;
    const userOrder = await Orders.findOne({ userId: user._id });

    const paymentVerified = validatePaymentVerification(
      { order_id: order.id, payment_id: payment.razorpay_payment_id },
      payment.razorpay_signature,
      process.env.SECRET_KEY
    );

    if (paymentVerified) {
      console.log('razorpay order :', order);

      // after successfull varification user order statuce change to placed
      userOrder.status = 'placed';
      await userOrder.save();

      // if order placed remove the cart
      await Cart.deleteOne({ user: user._id });

      //  changing cart item isPlaced field
      await CartItem.updateMany({ user: user._id }, { isPlaced: true });

      res.json({
        status: true,
      });
    } else {
      res.json({
        status: false,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

// apply coupon
const applyCoupon = async (req, res) => {
  try {
    const user = req.user;
    const { coupon } = req.body;

    console.log('cuopon code : ', coupon);

    // check the coupon valid or not
    const discountCoupon = await Coupon.findOne({ code: coupon });

    if (!discountCoupon) {
      throw new Error('invalid coupon code');
    }

    console.log('date now : ', new Date(Date.now()));
    console.log('coupon date : ', discountCoupon.expiry.toISOString());

    // check the coupon's validity expires or not
    if (Date.now() > new Date(discountCoupon.expiry).getTime()) {
      throw new Error('Coupon expired');
    }

    const userCart = await Cart.findOne({ user: user._id });

    const discountPercentage = discountCoupon.discount;

    // find the amount to substract from cart total
    const discountAmount = userCart.total * (discountPercentage / 100);

    // cart total arter discount
    userCart.total = userCart.total - discountAmount;

    await userCart.save();

    res.json({
      status: true,
      cartTotal: userCart.total,
    });
  } catch (err) {
    console.log(err.message);
  }
};

// for searching product
const searchProduct = async (req, res) => {
  try {
    const { inputData, category } = req.body;

    console.log(category);

    let searchProducts;
    if ( !category || category === '*') {
      // searching products in product collection
      searchProducts = await Products.find({
        name: {
          $regex: inputData,
          $options: 'i', // make it not case sensitive
        },
      }).populate('category');
    } else {
      // find the category
      const categoryDetails = await Category.findOne({
        name: category,
      });

      // searching products in product collection
      searchProducts = await Products.find({
        name: {
          $regex: inputData,
          $options: 'i', // make it not case sensitive
        },
        category: categoryDetails._id,
      }).populate('category');
    }

    if (searchProducts.length === 0) {
      return res.json({
        status: false,
      });
    }

    res.status(200).json({
      status: true,
      searchProducts,
    });
  } catch (err) {
    console.log(err.message);
    res.json({
      status: false,
    });
  }
};

const filterProduct = async (req, res) => {
  try {
    const { colour, price, sort, category } = req.body;

    let sortingCategory;
    if (category !== '*') {
      // find the category
      sortingCategory = await Category.findOne({
        name: category,
      });
    }

    let sortingOrder;
    if (sort === 'asc') {
      sortingOrder = 1 ;
    }
    if (sort === 'desc') {
      sortingOrder = -1 ;
    }

    const pipeline = [];

    if (colour || price) {
      const common = {
        $match: { $or: [{ colour: colour }, { price: { $lt: +price } }] },
      };
      pipeline.push(common);
    }

    // if sortinOrder is present
    if (sortingOrder) {
      pipeline.push({ $sort: { price: sortingOrder } });
    }

    // if category is present
    if (sortingCategory) {
      pipeline.push({ $match: { category: sortingCategory._id } });
    }

    const products = await Products.aggregate(pipeline);

    console.log(products);

    if (products.length > 0) {
      res.json({
        status: true,
        products,
      });
    } else {
      res.json({
        status: false,
      });
    }
  } catch (err) {
    res.json({
      status: false,
    });
  }
};

// downlod invoice
const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // order dertails
    const order = await Orders.findById(orderId)
      .populate('userId')
      .populate('address')
      .populate('products');

    if (!order) {
      throw new Error('Order not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the headers for downloading the PDF
    const fileName = `invoice-${order.orderId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    doc.fontSize(20).text('THRAYI FASHION', { align: 'center' }).moveDown();

    doc.fontSize(14).text(`Order ID: ${order.orderId}`);

    doc
      .fontSize(12)
      .moveDown()
      .text(`Customer Name: ${order.userId.name}`)
      .moveDown()
      .text(`Email: ${order.userId.emailId}`)
      .moveDown()
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown();

    // table header
    doc
      .fontSize(12)
      .text('Item', 50, 240)
      .text('Quantity', 250, 240)
      .text('Price', 350, 240)
      .text('Total', 450, 240);

    // for drawing line
    doc.moveTo(50, 260).lineTo(550, 260).stroke();

    let y = 280;

    // Add items to the invoice
    order.products.forEach((item) => {
      doc
        .fontSize(10)
        .text(item.name, 50, y)
        .text(item.quantity, 250, y)
        .text(`${item.price.toFixed(2)}`, 350, y)
        .text(`${item.total.toFixed(2)}`, 450, y);
      y += 20;
    });

    // Add total amount
    doc
      .fontSize(12)
      .text(`Total: ${order.totalAmount.toFixed(2)}`, 450, y + 40, {
        align: 'right',
      });

    // Footer
    doc
      .fontSize(10)
      .text('Thank you for shopping with us!', 50, y + 100, {
        align: 'center',
      });

    // End the document
    doc.end();
  } catch (err) {
    console.error('Error generating invoice:', err.message);
    res.status(500).send({ error: 'Failed to generate invoice.' });
  }
};

// request retrun
const returnRequest = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, productId, reason } = req.body;

    // finding the order
    const order = await Orders.findById(orderId);

    if (!order) {
      throw new Error('order is not found!');
    }

    const product = await CartItem.findById(productId);

    if (!product) {
      throw new Error('Returning product is not found');
    }

    // checking already requested for return
    const isReturnRequest = await Return.findOne({ orderId, productId });

    if (isReturnRequest) {
      throw new Error('Already requested for return!');
    }

    // changing the product isReturnRequest to true
    product.isReturnRequest = true;
    product.returnStatus = 'pending';
    product.save();

    // checking the last date for return is over or not
    const returnLastDate = new Date(order.date);
    returnLastDate.setDate(returnLastDate.getDate() + 15);
    const today = new Date();

    if ( today > returnLastDate ) {
      throw new Error('Return last Date is over!');
    }
    // console.log('return last date : ',returnLastDate) ;
    // console.log('ordered date : ', new Date(order.date)) ;

    // saving into retun model
    const returnRequest = new Return({
      orderId,
      productId,
      reason,
      status: 'pending',
      requested: new Date(),
    });

    await returnRequest.save();

    res.json({
      returnRequest: true,
    });
  } catch (err) {
    res.json({
      returnRequest: false,
      message: err.message,
    });
  }
};

// rating
const productRating = async (req, res) => {
  try {
    const user = req.user;

    const { star, comment } = req.body;
    const { productId } = req.params;

    const product = await Products.findById(productId);
    // check the user already rated on this product
    const alreadyRated = await product.ratings.find(
      (rating) => rating.postedBy.toString() === user._id.toString()
    );

    if (alreadyRated) {
      await Products.updateOne(
        { _id: productId, 'ratings.postedBy': user._id },
        {
          $set: {
            'ratings.$.star': star * 1,
            'ratings.$.comment': comment,
          },
        }
      );

      const updatedProduct = await Products.findById(productId);
      findTotalRating(updatedProduct);
    } else {
      // create rating
      const rating = {
        star: star * 1,
        comment: comment,
        postedBy: user._id,
      };
      product.ratings.push(rating);

      findTotalRating(product);
    }

    async function findTotalRating(product) {
      // to find number of ratings
      const numRatings = product.ratings.length;

      // to fing sum of all ratingss
      const allRatings = product.ratings.map((rate) => rate.star);
      const sumOfRatings = allRatings.reduce((acc, crr) => acc + crr, 0);

      const avgRating = Math.round(sumOfRatings / numRatings);

      product.totalRating = avgRating;
      await product.save();

      const recentRatings = await Products.findById(productId, { ratings: 1 })
        .sort({ 'ratings.postedAt': -1 })
        .populate({
          path: 'ratings.postedBy',
        });

      res.status(200).json({
        rated: true,
        recentRatings,
        avgRating: product.totalRating,
      });
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

// view product details
const viewProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    const product = await Products.findById(productId).populate({
      path: 'ratings.postedBy',
    });

    const recentRatings = await Products.findById(productId, { ratings: 1 })
      .sort({ 'ratings.postedAt': -1 })
      .limit(3)
      .populate('ratings.postedBy');

    console.log('recent ratingss--',recentRatings)  ;  

    // providing related products
    const productCategory = product.category;

    const relatedProducts = await Products.find({
      $and: [{ category: productCategory }, { _id: { $nin: product._id } }],
    });

    res.render('user/product', {
      product,
      isUserLoggedin,
      recentRatings,
      relatedProducts,
      cartProductCount,
      orderCount,
      wishlistProductCount,
    });
  } catch (err) {}
};

// get about page
const getAbout = async (req,res) => {
  try {
    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    const abouts = await About.find() ;
    res.render("user/about",{abouts,cartProductCount,orderCount,isUserLoggedin,wishlistProductCount})
  } catch (err) {
    
  }
}

// get contact page 
const getContact = async (req,res) => {
  try {
    const cartProductCount = await getCartCount(req.cookies);
    const orderCount = await getOrderCount(req.cookies);
    const isUserLoggedin = await isLogged(req.cookies);
    const wishlistProductCount = await getWishlistCount(req.cookies);

    const contacts = await Contact.find() ;
    
    const contact = contacts[0] ;

    res.render('user/contact',{cartProductCount,orderCount,isUserLoggedin,wishlistProductCount,contact})
  } catch (err) {
    
  }
}

module.exports = {
  getHome,
  getProfile,
  getLogin,
  getSignup,
  getProduct,
  signup,
  login,
  verifyOtp,
  getCart,
  addToCart,
  getProfileEdit,
  removeProduct,
  changeCartCount,
  placeOrder,
  getOrders,
  verifyPayment,
  editProfile,
  logout,
  getEmailEnter,
  forgottPassword,
  getResetPassword,
  resetPassword,
  addtoWishlist,
  getWishlist,
  applyCoupon,
  getVerifyPage,
  searchProduct,
  filterProduct,
  downloadInvoice,
  returnRequest,
  productRating,
  viewProduct,
  getAbout,
  getContact
};
