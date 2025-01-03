const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const userVerificationSchema = new Schema({
    userId : {
        type : mongoose.Schema.ObjectId ,
        required : true
    },
    verificationCode : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date ,
        required : true
    },
    expireAt : { 
        type: Date, 
       required : true
    }
})

const UserVerification = mongoose.model('UserVerification',userVerificationSchema) ;

module.exports = UserVerification ;