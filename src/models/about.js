const mongoose = require("mongoose") ;
const {Schema} = mongoose ; 

const aboutSchema = new Schema({
    image : {
        type : String,
        required : true
    } ,
    title : {
        type : String ,
        required : true
    } ,
    description : {
        type : String ,
        required : true
    }
})

const About = mongoose.model("About",aboutSchema)  ;

module.exports = About ;