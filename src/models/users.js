const mongoose = require('mongoose') ;
const {Schema} = mongoose ;
const crypto = require('crypto') ;

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    emailId : {
        type : String ,
        required : true
    },
    phoneNumber : {
        type : Number,
        required : true 
    },
    image : {
        type : String ,
        default : "user-2935527_1280.png" 
    },
    password : {
        type : String,
        required : true
    },
    address : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Address' ,
        required : false 
    },
    isVerified : {
        type : Boolean,
        required : true,
        default : false
    },
    isBlocked : {
        type : Boolean,
        default : false 
    },
    passwordResetToken : {
        type : String
    },
    passwordResetTokenExpires : {
        type : Date
    }
})

userSchema.method( 'createResetPasswordToken' ,function(){
     
    // generating random password token
    const resetToken = crypto.randomBytes(32).toString('hex') ;

    // then hashing this token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex') ;
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000 ;

    console.log('plane reset token :' , resetToken)
    console.log('hash reset token :' , this.passwordResetToken ) 

    return resetToken ;

})
const Users = mongoose.model("Users",userSchema) ;

module.exports = Users ;