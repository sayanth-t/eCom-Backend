const mongoose = require('mongoose') ;


const connectDB = async () => {
    mongoose.connect( "mongodb+srv://sayantht160:ofTw9ri546Hz5GPU@e-commerce.oalmg.mongodb.net/?retryWrites=true&w=majority&appName=e-commerce" ) ;
}

module.exports = {connectDB}