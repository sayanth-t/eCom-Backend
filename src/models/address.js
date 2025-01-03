const mongoose = require('mongoose') ;
const {Schema} = mongoose  ;

const addressSchema = new Schema ({
    userId : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true
    },
    country : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    pinNo : {
        type : Number,
        required : true
    }
})

// creating address model
const Address = mongoose.model('Address',addressSchema) ;

module.exports = Address ;