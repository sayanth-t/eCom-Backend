const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const adminSchema = new Schema ({
    name : {
        type : String ,
        required : true
    },
    emailId : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }
},{timestamps:true}) ;

const Admin = mongoose.model('Admin',adminSchema) ;

module.exports = Admin ;