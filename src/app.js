
const express = require('express') ;
const app = express() ;
const {connectDB} = require('./config/dataBase') ;

const path = require('path');


const nocache = require('nocache') ;
app.use(nocache()) ;

require('dotenv').config() ;

 
const {userRouter} = require('./routes/userRouter') ;
const {adminRouter} = require('./routes/adminRouter') ;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cookiParser = require('cookie-parser') ;
app.use(cookiParser()) ;

// Serve static files
app.use( express.static ( path.join ( __dirname , 'public')));

app.set('views', path.join( __dirname , 'views' ));  
app.set('view engine', 'ejs'); 


app.use('/',userRouter) ;
app.use('/',adminRouter) ;

const port = process.env.PORT || 3000

connectDB()
    .then(()=>{
        console.log('database is connected successfully') ;
        app.listen(port,()=>{
            console.log('server is start listen on 3000') ;
        })
    })
    .catch(()=>{
        console.log('something went wrong..') ;
    })

