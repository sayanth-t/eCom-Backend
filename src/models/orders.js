const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const ordersSchema = new Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users' , 
        required : true,
        
    },
    orderId : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true 
    },
    address : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Address' ,
        required : true
    },
    products : {
        type : [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
        ref : 'CartItem'
    },
    totalAmount : {
        type : Number,
        required : true
    },
    paymentMethod : {
        type : String ,
        enum: {
            values: ['cod','onlinePayment'],
            message: '{VALUE} is not supported'
          }
    },
    status : {
        type : String,
        enum: {
            values: ['pending','placed'],
            message: '{VALUE} is not supported'
          }
    },
    date : {
        type : Date 
    }
},{ timestamps: true })

// creating orders schema
const Orders = mongoose.model('Orders',ordersSchema) ;

module.exports = Orders ;