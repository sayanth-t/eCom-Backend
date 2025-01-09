const express = require('express') ;
const app = express() ;
const {connectDB} = require('./config/dataBase') ;

const nocache = require('nocache') ;
app.use(nocache()) ;

require('dotenv').config() ;
app.set('view engine','ejs') ;


 
const {userRouter} = require('./routes/userRouter') ;
const {adminRouter} = require('./routes/adminRouter') ;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cookiParser = require('cookie-parser') ;
app.use(cookiParser()) ;



const path = require('path');
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views' ));

app.use('/',userRouter) ;
app.use('/',adminRouter) ;


connectDB()
    .then(()=>{
        console.log('database is connected successfully') ;
        app.listen(3000,()=>{
            console.log('server is stert listen on 3000') ;
        })
    })
    .catch(()=>{
        console.log('something went wrong..') ;
    })

