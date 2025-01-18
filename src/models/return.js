const mongoose = require('mongoose') ;
const {Schema} = mongoose ; 

const retrun = new Schema({
    orderId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Orders' ,
        required : true
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'CartItem' ,
        required : true
    },
    reason : {
        type : String,
        required : true
    } ,
    status : {
        type : String ,
        enum: {
            values: ["pending","approved","rejected"],
            message: '{VALUE} is not supported'
        },
        required : true
    },
    requested : {
        type : Date ,
        required : true
    }
},{timestamps:true})

const Return = mongoose.model('Return',retrun) ;

module.exports = Return ;