const mongoose = require('mongoose') ;
const {Schema} = mongoose ;

const productsSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number ,
        required : true
    },
    description : {
        type : String ,
        required : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Category' ,
        required : true
    },
    quantity : {
        type : Number ,
        required : true 
    },
    image : [
        {
            type : String , 
            required : true
        }
    ],
    size : {
        type : String ,
        required : true,
        enum: {
            values: ['xs','s','m','l','xl'],
            message: '{VALUE} is not supported'
          }
    },
    colour : {
        type : String,
        required : true
    },
   
    dateCreated : {
        type : Date ,
        default : Date.now()
    },
    ratings : [
        {
            star : Number ,
            comment : String ,
            postedBy : {
                type : mongoose.Schema.Types.ObjectId ,
                ref : "Users"
            } 
        }
    ] ,
    totalRating : {
        type : String,
        default : 0
    }
})

// creating model for products
const Products = mongoose.model('Products',productsSchema) ;

module.exports = Products ;
