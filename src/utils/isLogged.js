const jwt = require('jsonwebtoken') ;
const Users = require('../models/users') ;

const isLogged = async (cookie) => {
    try {
        const {token} = cookie ;
        let isUserLoggedin = false ;
        
        if(token) {

               
                // verify the token 
                const decoded = jwt.verify( token , process.env.JWT_PRIVATEKEY ) ;
                const {userId} = decoded ;

                // find the user with curresponding userId
                const user = await Users.findById(userId) ;

                if(user){
                    isUserLoggedin = true  ;
                }

        }
        return isUserLoggedin
       
    } catch (err) {
        console.log(err.message) ;
    }
}

module.exports = {isLogged} ;