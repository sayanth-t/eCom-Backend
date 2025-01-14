
const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const bannerSchema = new Schema ({
    title : {
        type : String,
        required : true
    },
    subTitle : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    }
},{timestamps : true})

const Banner = mongoose.model('Banner',bannerSchema) ;

module.exports = Banner ;