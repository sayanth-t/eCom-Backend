const jwt  = require('jsonwebtoken') ;
const Wishlist = require('../models/wishlist')

const getWishlistCount = async (cookie) => {
    try {

        let wishlistProductCount  = 0 ;
        const {token} = cookie ;
        if(token) {
            const {userId} = await jwt.verify( token , process.env.JWT_PRIVATEKEY ) ;

            // find wishlist
            const wishlist = await Wishlist.findOne({userId})
            if(wishlist) {
                wishlistProductCount = wishlist.product.length 
            }
            return wishlistProductCount 
        }
    } catch (err) {
        
    }
}

module.exports = {getWishlistCount} ;