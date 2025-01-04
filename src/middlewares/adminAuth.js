const Admin = require('../models/admin') ;
const jwt = require('jsonwebtoken') ;

const adminAuth = async (req,res,next) => {
    try {
        const {token} = req.cookies ;
        if(!token) {
            throw new Error('invalid token') ;
        }

        const decoded = jwt.verify(token,process.env.JWT_PRIVATEKEY ) ;
        const {adminId} = decoded ;

        const admin = await Admin.findById(adminId) ;

        if(!admin){
            throw new Error('invalid admin') ;
        }

        req.admin = admin ;

        next()
    } catch (err) {
        console.log(err.message) ;
        res.redirect('/admin/login') ;
    }
}

module.exports = {adminAuth}