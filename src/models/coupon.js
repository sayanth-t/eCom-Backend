const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const couponSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    code : {
        type : String,
        required : true
    },
    startDate : {
        type : Date,
        required : true,
        default : Date.now()
    },
    expiry : {
        type : Date ,
        required : true 
    },
    discount : {
        type : Number ,
        required : true
    }
})

const Coupen = mongoose.model('Coupen',couponSchema) 

module.exports = Coupen ;