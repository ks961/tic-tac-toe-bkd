import type { Request, Response } from "express";
import IdentityService from "services/Identity";
import { type ClientRequest } from "typing/typing";

export type Session = {
    token: string,
}

export default function verifyTokenController(req: Request, res: Response) {
    const requestData: ClientRequest<Session> = req.body;
    
    try {
        
        const session = requestData.payload;
        
        const isValid = IdentityService.verifyJWT(session.token);
        
        if(!isValid) throw new Error("");
        
        res.send(JSON.stringify({
            status: 200,
            payload: isValid,
        }));  
        
    } catch(err) {
                
        res.send(JSON.stringify({
            status: 401,
            payload: false,
        }))
    }
}