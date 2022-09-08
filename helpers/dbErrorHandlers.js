"use strict";
//Get unique error field name
const uniqueMessage= error => {
    let output;
    try{
        let fieldName=error.message.substring(
            error.message.lastIndexOf(".$") + 2,
            error.message.lastIndexOf("_1")
        );
        output =
        fieldName.charAt(0).toUpperCase()+fieldName.slice(1)+ "Already Exists";
    }catch(ex){
        output="Unique Field Already Exists"
    }
    return output;
};
//get Error message from error object
exports.errorHandler= error => {
    console.log(error);
    let message = "";
    if (error.code){
        switch (error.code){
            case 11000:
            case 11001:
                message=uniqueMessage(error);
                break;
            default:
                message="Something went wrong"
        }   
    }
    else{
        for(let errorName in error.erroros){
            if(error.erroros[errorName].message){
                message=error.erroros[errorName].message;
            }
        }
    }
    return message;
};