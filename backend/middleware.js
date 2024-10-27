const jwt = require("jsonwebtoken");

const authmiddleware=(req,res,next)=>{
    const authheader=req.headers.authorization;
    if(!authheader||!authheader.startsWith("Bearer ")){
        return res.status(403).json({
            message:"Invalid auth header"
        })
    }
    const token=authheader.split(" ")[1];
        try{
           const decoded= jwt.verify(token,process.env.JWT_SECRET);
           if(decoded.userId){
            req.userId=decoded.userId;
            next();
           }
           else{
            return res.status(403).json({
                message: "Invalid auth header"
            })
           }
        }catch(err){
            return res.status(403).json({
                message: "Invalid auth header",
              });
        }
};
module.exports=authmiddleware;