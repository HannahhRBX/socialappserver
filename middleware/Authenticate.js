import jwt from "jsonwebtoken";

// Middleware pass function to authenticate token against public key
export const authenticateToken = async (req,res,next) =>{
    try{
        const header = req.headers["authorization"];
        const token = header && header.split(" ")[1]
        
        if (!token){
            return res.status(403).send("Access Denied");
        }
        jwt.verify(token, process.env.PUBLIC_KEY,(error,verified) =>{
            if (error) return res.status(403).send("Access Denied");
            console.log("Authorization Successful.")
            req.user = verified; // Get User's Id from verified.id
            next();
        });
    }catch(error){
        res.status(404).json({message: error.message})
    };
};