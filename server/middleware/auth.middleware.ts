import {Response,Request,NextFunction} from "express";
import {verify} from "jsonwebtoken";
const secretKey = 'rip8';

module.exports = (req:Request,res:Response,next:NextFunction)=>{
    if(req.method === 'OPTIONS'){
        return next();
    }
    try{
        const token = req.headers.authorization?.split(' ')[1];
        if(!token) return res.status(401).send('no token');
        const decoded = verify(token,secretKey);
        req.body.user = decoded;
        next();
    } catch (e) {
        return res.status(401).send('server error');
    }
}