import { currentTimeInUTC, fromMintueToMillisec, generateSafeOtp, hashify, isDevEnvironment } from "utils";
import OTPService from "./base";
import mailService from "services/mail";
import { RuntimeError } from "typing/typing";
import { redisClient } from "models/redis";
import { mailTemplateForOtp } from "config/mail";
import type { SessionId } from "services/Identity";


export class OtpServiceViaEmail extends OTPService {
    #otp = 0;
    #body: string;
    #title: string;
    #toMail: string;
    #subject: string;
    static #REDIS_KEY_PREFIX = "emailOtp";

    constructor(toMail: string, title: string, subject: string, body: string) {
        super();
        this.#body = body;
        this.#title = title;
        this.#toMail = toMail;
        this.#subject = subject;
    }

    async send(): Promise<void> {
        const body = mailTemplateForOtp(
            this.#title,
            this.#body,
            this.#otp
        );

        const wasSuccess = await mailService.sendMail(this.#toMail, this.#subject, body);
        if(!wasSuccess)
            throw new RuntimeError("Something went wrong while signing up, Try again", 500);
    }

    async createVerificationSession (uniqueValue: string): Promise<SessionId> {
        this.#otp = generateSafeOtp();
        const sessionId = hashify(`${uniqueValue}${currentTimeInUTC()}`);

        await redisClient.set(sessionId, this.#otp)
            .catch(err => {
                    throw new RuntimeError(isDevEnvironment() ? err.message 
                        : "Something went wrong, Try again", 500)
            });

        // TODO: Make sure to cleanup timeout when otp validation is done.
        setTimeout(() => {

            redisClient.del(sessionId);

        }, fromMintueToMillisec(5));

        return sessionId;
    }
}