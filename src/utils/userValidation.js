const validator = require('validator') ;

const userValidator = async (user) => {

    const errors = []
    let isValid = false ;

        const {name,emailId,phoneNumber,password,confirmPassword} = user ;

         // Validate Username
        if (!name || !validator.isLength(name, { min: 3, max: 15 })) {
            errors.push("Username must be between 3 and 15 characters.");
        }
        if (!validator.isAlpha(name)) {
            errors.push("Username can only contain letters");
        }

        // validate emailId
        if(!validator.isEmail(emailId)){
            errors.push("invalid email ID") ;
        }

        // validate phoneNumber
        if(!validator.isMobilePhone(phoneNumber,'en-IN')) {
            errors.push("invalid Phone Number") ;
        }

        // validate password
        if(!validator.isStrongPassword(password)){
            errors.push("password is not strong") ;
        }

        // validate confirm password is equal to password
        if(!(password === confirmPassword)){
            errors.push("password is not match") ;
        }

        if(errors.length === 0){
             isValid = true
        }
            
        return {
            isValid,
            errors
        }
   
}

module.exports = {userValidator} ;