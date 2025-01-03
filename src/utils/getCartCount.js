const jwt  = require('jsonwebtoken') ;
const Cart = require('../models/cart') ;

const getCartCount = async ( cookie )=>{

    const {token} = cookie ;
    if(token){
    const {userId} = await jwt.verify( token , process.env.JWT_PRIVATEKEY ) ;
    const cart = await Cart.findOne({user:userId}) ;
    if(!cart){
        return 
    }
    let cartProductCount = cart.products.length ;

    if(cartProductCount === 0){
        cartProductCount = 0
    }
    
    return cartProductCount 
    }
   
}

module.exports = {getCartCount} ;