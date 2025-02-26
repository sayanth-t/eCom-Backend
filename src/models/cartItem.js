const mongoose = require('mongoose') ;

const {Schema} = mongoose ;

const cartItemSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Users',
        required : true
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Products' ,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    image : [
        {
            type : String,
            required : true
        }
    ],
    size : {
        type : String ,
        required : true
    },
    colour : {
        type : String ,
        required : true
    },
    quantity : {
        type : Number ,
        required : true
    },
    price : {
        type : Number ,
        required : true 
    },
    total : {
        type : Number ,
        required : true
    },
    isPlaced : {
        type : Boolean ,
        default : false
    },
    isReturnRequest : {
        type : Boolean,
        default : false
    },
    returnStatus : {
        type : String ,
        enum: {
            values: ['pending','approved','rejected'],
            message: '{VALUE} is not supported'
          }
    }
    
}, { timestamps: true }) ;

cartItemSchema.pre('save' ,function (next){
    if(!this.isReturnRequest) {
        this.returnStatus = undefined
    }
    next();
})

const CartItem = mongoose.model('CartItem',cartItemSchema) ;

module.exports = CartItem