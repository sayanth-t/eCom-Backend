const validator = require('validator') ;

const productValidator = (product) => {
  
        const {name,category,price,description,quantity,size,colour} = product  ;
        const errors = [] ;
        let isValid = false ;

        // validating name
        if(validator.isEmpty(name)){
            errors.push('product name is empty') ;
        }
        if(!validator.isLength(name,{ min : 5 , max : 100})){
            errors.push('product name characters must 5 to 100') ;
        }

        // validating price
        if(!validator.isNumeric(price)){
            errors.push ('price must be a number') ;
        }
        if(price < 0){
            errors.push('price mut be a positive number') ;
        }

        // validating description
        if(!validator.isLength(description,{ min : 20 , max : 300})){
            errors.push('product description lenght must 20 to 100') ;
        }

        // vaildating quantity
        if(quantity < 100) {
            errors.push ('quantity must greater than 100') ;
        }

        // validating size 
        const allowedSizes = ['xs','s','m','l','xl'] ;
        const enteredSize = size.toLowerCase() ;

        if(!allowedSizes.includes(enteredSize)){
            errors.push('invalid size') ;
        }

        if(errors.length === 0){
            isValid = true
        }
        
        return {
            isValid,
            errors
        }
    }
 

module.exports = {productValidator} 