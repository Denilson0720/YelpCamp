// returns a function that runs a function
// this returned function catches any error if any and passes it to next, so it can be handled by the basic error handler
module.exports = func =>{
    return (req,res,next)=>{
        func(req,res,next).catch(next);
    }

}