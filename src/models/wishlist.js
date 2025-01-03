const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const wishlistSchema = new Schema ({

    userId : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true
    },
    product : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Products' ,
        required : true
    }]
    
},{timestamps:true})

const Wishlist = mongoose.model('Wishlist',wishlistSchema) ;

module.exports = Wishlist ;