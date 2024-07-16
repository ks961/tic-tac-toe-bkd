import type { Request, Response } from "express";
import IdentityService from "services/Identity";
import {type SingupCredentialDTO } from "models/DTOs/signup";
import { RuntimeError, type ClientRequest, type ServerResponse, type VerificationCredential } from "typing/typing";
import { isDevEnvironment } from "utils";



export async function signUpController(req: Request, res: Response) {
    const requestData: ClientRequest<SingupCredentialDTO> = req.body;

    let response: ServerResponse<string> = {
        status: 500,
        payload: "Something went wrong!"
    };
    
    try {
        
        const signupData = requestData.payload;
        
        response = await IdentityService.isUserExists(signupData);
        
        if(response.status !== 200)
            throw new RuntimeError(response.payload, response.status);

        const sessionId = await IdentityService.emailAddressVerification(signupData)
            .catch(err => { throw new RuntimeError(err.message, err.statusCode) });

        response = {
            status: 200,
            payload: sessionId,
        }

    } catch(err) {

        
        if(err instanceof RuntimeError) {
        
            response = {
                status: err.statusCode ? err.statusCode : 500,
                payload: err.message,
            }
        
        } else {

            response = {
                ...response,
    
                payload: isDevEnvironment() ? 
                    (err as Error).message : response.payload,
            }
        }


    } finally {
        res.send(JSON.stringify(response));
    }
}

export async function verifySignupController(req: Request, res: Response) {
    const requestData: ClientRequest<VerificationCredential> = req.body;    

    let response: ServerResponse<string> = {
        status: 400,
        payload: "Invalid Session or Otp",
    };

    try {
        await IdentityService.verifyOtpForSignUp(requestData.payload.sessionId, requestData.payload.otp);
        
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