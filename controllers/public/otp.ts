import type { Request, Response } from "express";
import { validateOtp } from "services/otp/verification";
import { type ClientRequest, type VerificationCredential, type ServerResponse, RuntimeError } from "typing/typing";


export async function otpVerificationController(req: Request, res: Response) {
    const requestData: ClientRequest<VerificationCredential> = req.body;    

    let response: ServerResponse<string> = {
        status: 400,
        payload: "Invalid Session or Otp",
    };

    try {
        await validateOtp(requestData.payload.sessionId, requestData.payload.otp);
        
        response = {
            status: 200,
            payload: "success",
        }

    } catch(err) {

        if(err instanceof RuntimeError) {
            response = {
                status: err.statusCode ? err.statusCode : 403,
                payload: err.message,
            }
        }
    } finally {
        res.send(JSON.stringify(response));
    }
}