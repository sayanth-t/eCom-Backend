const jwt  = require('jsonwebtoken') ;
const Wishlist = require('../models/wishlist')

const getWishlistCount = async (cookie) => {
    try {
        const {token} = cookie ;
        if(token) {
            const {userId} = await jwt.verify( token , process.env.JWT_PRIVATEKEY ) ;

            // find wishlist
            const wishlist = await Wishlist.findOne({userId})
            return wishlistProductCount = wishlist.product.length 
        }
    } catch (err) {
        
    }
}

module.exports = {getWishlistCount} ;