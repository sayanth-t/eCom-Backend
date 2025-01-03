const Users = require('../models/users') ;
const jwt = require('jsonwebtoken') ;

const userAuth = async (req,res,next) => {
    try {
        const {token} = req.cookies ;
        if(!token){
           throw new Error('invalid token') ;
        }
        
        // verify the token 
        const decoded = jwt.verify( token , process.env.JWT_PRIVATEKEY ) ;
        const {userId} = decoded ;

        // find the user with curresponding userId
        const user = await Users.findById(userId) ;

        if(!user){
            throw new Error('user is not found') ;
        }

        // assign the user to req.user
        req.user = user ;

        next() ;

    } catch (err) {
        console.log(err.message) ;

        // Check if the request is AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // Send a JSON response for AJAX requests
            return res.json ({
                status : false
            })
        }

        res.redirect('/login') ;
    }
}

module.exports = {userAuth} ;