const { error } = require('toastr');
const validator = require('validator') ;

const addressValidator = (userAddress) =>{
    
    const {country,state,address,city,postcode} = userAddress ;

    const errors = []
    let isValid = false ;

    // validate pin Number
    if(!validator.isPostalCode(postcode,country.slice(0,2))){
        errors.push('invalid pin number!') ;
    }

    if(errors.length === 0){
        isValid = true
    }

    return {
        isValid , 
        errors
    }
}

module.exports = {addressValidator}