const mongoose = require('mongoose') ;

const {Schema} = mongoose ;

const cartSchema = new Schema({
    user : {
        type : mongoose.Schema.ObjectId ,
        required : true
    },
    cartId : {
        type : mongoose.Schema.ObjectId ,
        required : true
    },
    products : {
        type : [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
        required : true 
    },
    total : {
        type : Number,
        required : true,
        default : 0
    }
}, { timestamps: true }) ;


const Cart = mongoose.model('Cart',cartSchema) ;

module.exports = Cart