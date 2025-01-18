const mongoose = require("mongoose") ;
const {Schema} = mongoose ;

const walletSchema = new Schema ({
    userId : {
        type : mongoose.Schema.Types.ObjectId , 
        required : true
    } ,
    balance : {
        type : Number , 
        required : true
    } ,
    transactions : [
        {
            type : {
                type : String ,
                enum: {
                    values: ['credit', 'debit'],
                    message: '{VALUE} is not supported'
                  } ,
                  required : true
            },
            amount : {
                type : Number ,
                required : true
            },
            description : {
                type : String 
            }
        }
    ]
})

const Wallet = mongoose.model("Wallet",walletSchema) ;

module.exports = Wallet ;