const jwt  = require('jsonwebtoken') ;
const Cart = require('../models/cart') ;
const Orders = require('../models/orders');

const getOrderCount = async ( cookie )=>{

    let ordersCount ;
    const {token} = cookie ;
    if(token){
    const {userId} = await jwt.verify( token , process.env.JWT_PRIVATEKEY ) ;
    
    const orders = await Orders.find({userId}) ;
    if(orders){
        return ordersCount = orders.length
    }
    else {
        return ordersCount = 0
    }
  
    }
   
   
}

module.exports = {getOrderCount} ;