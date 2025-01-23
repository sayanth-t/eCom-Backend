const mongoose = require("mongoose") ;
const {Schema} = mongoose ; 

const contactSchema = new Schema({
    address : {
        type : String,
        required : true
    } ,
    phNumber : {
        type : String ,
        required : true
    } ,
    emailId : {
        type : String ,
        required : true
    }
})

const Contact = mongoose.model("Contact",contactSchema)  ;

module.exports = Contact ;