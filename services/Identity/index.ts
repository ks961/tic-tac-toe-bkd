import jwt from "jsonwebtoken";
import { TABLES } from "config/database";
import { getDataFromDatabase, isDataExists } from "models/db/generic";
import { insertUserData, updatePassword } from "models/db/signup";
import type { LoginCredentialDTO, UpdatePasswordDTO, UserIndentifierDTO } from "models/DTOs/login";
import { SingupCredentialToUserDTO, type SingupCredentialDTO, type UserDTO, type UserExistsQueryDTO } from "models/DTOs/signup";
import { RuntimeError, type AcceptedJwtTypes, type JwtPayload, type ServerResponse } from "typing/typing";
import { currentTimeInUTC, dateToSeconds, fromMintueToMillisec, generateSafeOtp, hashify, isDevEnvironment, validateEmail } from "utils";
import mailService from "services/mail";
import { mailTemplateForOtp } from "config/mail";
import { OtpServiceViaEmail } from "services/otp/email";
import { redisClient } from "models/redis";
import { validateOtp } from "services/otp/verification";

export type SessionId = string;

export default class IdentityService {
    static #SESSION_LIMIT = 3600; // secs = [ 1 hour ]
    static #JWT_SECRET = process.env.JWT_SEC;
    static #ForgotPasswordPrefix = "forgotPassword";
    static #SignupCredsBacklogPrefix = "signupCredsBacklog";
    
    static async registerUser(creds: SingupCredentialDTO) {

        const playerId = IdentityService.generateUniquePlayerId(creds);
        const hashedPassword = hashify(creds.password);
    
        const user: UserDTO = SingupCredentialToUserDTO(creds, {playerId, hashedPassword});

        await insertUserData(user);
    }
    
    static async isUserExists(creds: SingupCredentialDTO): Promise<ServerResponse<string>> {
        
        let response: ServerResponse<string> = {
            status: 200,
            payload: "success",
        }
    
        const rows = await isDataExists<UserExistsQueryDTO>(
            ["email", "username"], 
            "email = ? OR username = ?",
            TABLES.users,
            [creds.email, creds.username]
        );
            
        const isExists = (rows.length === 1);
        
        if(isExists) {
    
            const rowValues = Object.values(rows[0]);
            const key = (Object.keys(rows[0]).filter((key) => rowValues.includes(creds[key as keyof SingupCredentialDTO])))[0] as keyof SingupCredentialDTO;        
            
            response = {
                status: 403,
                payload: `User with ${key} "${creds[key]}" already registered.`,
            }
        }
    
    
        return response;
    }
    
    static async verifyLoginCredential(creds: LoginCredentialDTO): Promise<boolean> {
    
        try {
            const isEmail = validateEmail(creds.usernameOrEmail);
            const field = isEmail ? "email" : "username";
    
            const hashedPassword = hashify(creds.password);
    
    
            const rows = await isDataExists<UserExistsQueryDTO>(
                [field, "password"], 
                `${field} = ? AND password = ?`, 
                TABLES.users, 
                [creds.usernameOrEmail, hashedPassword]
            );
            
            const isExists = (rows.length === 1);
    
            return isExists;
    
        } catch(err) {
    
            throw new Error(isDevEnvironment() ? 
            (err as Error).message : "Something went wrong!");
        }
    }
    
    static signJWT<T extends AcceptedJwtTypes>(payload: T): string {
        const token = jwt.sign(payload, IdentityService.#JWT_SECRET as string, { expiresIn: "1h" });
        return token;
    }
    
    static generateCookie(jwtToken: string, maxAge: number) {
        return `authToken=${jwtToken}; path=/; Max-Age=${maxAge}; SameSite=None;`;
    }
    
    
    static verifyJWT(token: string) {
        try {
            
            const result = (jwt.verify(token, IdentityService.#JWT_SECRET as string) as JwtPayload);
    
            const createdAt = new Date(result.createdAt);
            const currentTime = new Date();
    
            const createdAtInSec = dateToSeconds(createdAt);
            const currentTimeInSec = dateToSeconds(currentTime);
            
            const elapsedTimeInSec = currentTimeInSec - createdAtInSec;
    
            return (elapsedTimeInSec < IdentityService.#SESSION_LIMIT);
        } catch(err) {        
            return false;
        }
    }
    
    static generateUniquePlayerId(userData: Record<string, string>) {
        const value = Object.keys(userData).reduce((acc: string, key)=>  {
            acc += userData[key];
            return acc;
        });
    
        const uniqueValue = `${value}${currentTimeInUTC()}`
    
        return hashify(uniqueValue);
    }
    
    
    static async emailAddressVerification(creds: SingupCredentialDTO): Promise<SessionId> {
        
        const titleAndSubject = "Email verification";

        const otpService = new OtpServiceViaEmail(
            creds.email,
            titleAndSubject,
            titleAndSubject,
            "Please enter this OTP to complete the verification process. Do not share this OTP with anyone for security reasons. OTP is valid for 5 min.",
        );

        const uniqueValue = `${creds.email}${creds.username}`;

        const sessionId = await otpService.createVerificationSession(uniqueValue)
            .catch(err => { throw new RuntimeError(err.message, err.statusCode) });

        const key = `${IdentityService.#SignupCredsBacklogPrefix}-${sessionId}`;

        redisClient.set(key, JSON.stringify(creds));

        await otpService.send();

        return sessionId;
    }

    static async verifyOtpForSignUp(sessionId: SessionId, otp: (number | string)): Promise<boolean> {
        if(typeof otp === "string")
            otp = parseInt(otp);

        await validateOtp(sessionId, otp);

        const key = `${IdentityService.#SignupCredsBacklogPrefix}-${sessionId}`;

        const data = await redisClient.get(key);

        if(!data)
            throw new RuntimeError("Something went wrong with credential, Try again", 500);        

        const creds: SingupCredentialDTO = JSON.parse(data);

        try {

            await IdentityService.registerUser(creds);

        } catch(err: unknown) {

            throw new RuntimeError(isDevEnvironment() ? (err as Error).message 
                : "Something went while registration, Try again", 500);
        }
        
        redisClient.del(key);

        return true;
    }

    static async createForgotPasswordSession(creds: UserIndentifierDTO): Promise<string> {
        const titleAndSubject = "Forgot Password Verification";

        const isEmail = validateEmail(creds.usernameOrEmail);

        if(!isEmail) {

            const rows = await getDataFromDatabase({
                table: TABLES.users,
                conditionalColumns: ["username"],
                values: [creds.usernameOrEmail],
                selectColumns: ["email"]
            });

            if(Array.isArray(rows) && rows.length <= 0) {
                throw new RuntimeError("Username doesn't exists.", 404);
            }

            creds.usernameOrEmail = (rows as any)[0]["email"];
        } else {
            
            const rows = await getDataFromDatabase({
                table: TABLES.users,
                conditionalColumns: ["email"],
                values: [creds.usernameOrEmail],
                selectColumns: ["email"]
            });

            if(Array.isArray(rows) && rows.length <= 0) {
                throw new RuntimeError("Email doesn't exists.", 404);
            }
        }

        const otpService = new OtpServiceViaEmail(
            creds.usernameOrEmail,
            titleAndSubject,
            titleAndSubject,
            "Please enter this OTP to complete the verification process. Do not share this OTP with anyone for security reasons. OTP is valid for 5 min.",
        );

        const sessionId = await otpService.createVerificationSession(creds.usernameOrEmail)
            .catch(err => { throw new RuntimeError(err.message, err.statusCode) });

        redisClient.set(`${this.#ForgotPasswordPrefix}-${sessionId}`, JSON.stringify(creds));

        await otpService.send();

        return sessionId;
    }

    static async verifyOtpForForgotPassword(sessionId: SessionId, otp: (number | string)): Promise<string> {

        if(typeof otp === "string")
            otp = parseInt(otp);

        
        await validateOtp(sessionId, otp);

        const updateToken = hashify(`${sessionId}${otp}`);

        redisClient.set(updateToken, sessionId);
        return updateToken;
    }

    static async updateUserPassword(upateCreds: UpdatePasswordDTO) {
        
        const sessionId = await redisClient.get(upateCreds.updateToken);

        if(!sessionId) {
            throw new RuntimeError("Invalid Update token", 400);
        }
        
        const key = `${this.#ForgotPasswordPrefix}-${sessionId}`;
        const data = await redisClient.get(key);
        if(!data) {
            throw new RuntimeError("Something went wrong while updating Password", 500);
        }

        const creds: UserIndentifierDTO = JSON.parse(data);

        const hashedPassword = hashify(upateCreds.password);
    
        await updatePassword(creds.usernameOrEmail, hashedPassword);

        redisClient.del(key);
        redisClient.del(upateCreds.updateToken);
    }

}