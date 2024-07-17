import type { Request, Response } from "express";
import { getPlayerIdByEmailOrUsername } from "models/db/player";
import type { LoginCredentialDTO, OtpVerificationDTO, UpdatePasswordDTO, UserIndentifierDTO } from "models/DTOs/login";
import IdentityService from "services/Identity";
import { RuntimeError, type ClientRequest, type JwtPayload, type LoginSuccessPayload, type ServerResponse } from "typing/typing";



export async function loginController(req: Request, res: Response) {
    const requestData: ClientRequest<LoginCredentialDTO> = req.body;
    
    const loginData = requestData.payload;
    
    let response: ServerResponse<string | LoginSuccessPayload> = {
        status: 500,
        payload: "Something went wrong!"
    };

    try {

        const isValid = await IdentityService.verifyLoginCredential(loginData);
    
        if(!isValid)
            throw new RuntimeError("Invalid Login Credential", response.status);
        
        const playerInfo = await getPlayerIdByEmailOrUsername(loginData.usernameOrEmail);
    
        const token = IdentityService.signJWT<JwtPayload>({
            usernameOrEmail: loginData.usernameOrEmail,
            createdAt: new Date().toUTCString(),
        });
    
    
        response = {
            status: 200,
            payload: {
                playerInfo: {
                    username: playerInfo.username,
                    playerId: playerInfo.playerId
                },
                token,
            }
        }
    
    } catch(err) {
        console.log(err);
        
        if(err instanceof RuntimeError) {
            response = {
                status: err.statusCode ? err.statusCode : 500,
                payload: err.message,
            }
        
        } else {

            response = {
                ...response,
                payload: (err as Error).message,
            }
        }


    } finally {        
        res.send(JSON.stringify(response));
    }
}

export async function loginForgotPasswordController(req: Request, res: Response) {
    const requestData: ClientRequest<UserIndentifierDTO> = req.body;

    let response: ServerResponse<string> = {
        status: 500,
        payload: "Something went wrong",
    }

    try {

        const sessionId = await IdentityService.createForgotPasswordSession(requestData.payload);

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
        }
    } finally {
        res.send(JSON.stringify(response));
    }

}

export async function loginForgotPasswordVerifyOtpController(req: Request, res: Response) {
    const requestData: ClientRequest<OtpVerificationDTO> = req.body;    

    let response: ServerResponse<string> = {
        status: 500,
        payload: "Something went wrong",
    }   

    try {

        const updateToken = await IdentityService
                    .verifyOtpForForgotPassword(requestData.payload.sessionId, requestData.payload.otp);

        response = {
            status: 200,
            payload: updateToken,
        }

    } catch(err) {
        if(err instanceof RuntimeError) {
            response = {
                status: err.statusCode ? err.statusCode : 500,
                payload: err.message,
            }
        }
    } finally {
        res.send(JSON.stringify(response));
    }

}

export async function updatePasswordController(req: Request, res: Response) {
    const requestData: ClientRequest<UpdatePasswordDTO> = req.body;

    let response: ServerResponse<string> = {
        status: 500,
        payload: "Something went wrong",
    }

    try {
    
        await IdentityService.updateUserPassword(requestData.payload);

        response = {
            status: 200,
            payload: "success",
        }
    
    } catch(err) {
        if(err instanceof RuntimeError) {
            response = {
                status: err.statusCode ? err.statusCode : 500,
                payload: err.message,
            }
        }
    } finally {
        res.send(JSON.stringify(response));
    }
}