const asyncHandler = (fn) => async (req , res , next) =>{
    try {
        await fn(req,res,next);
    } catch (error) {
        res.status(err.code).json({
            success: false,
            message:err.message
        })
    }
}

// --------------------------------- Other Way of doing -----------------------

// const asyncHandler = (requestHandler) => {
//     return (req , res , next) =>{
//         Promise.resolve(requestHandler(req, res, next)).catch((e) => next(e))
//     }
// }

export {asyncHandler};