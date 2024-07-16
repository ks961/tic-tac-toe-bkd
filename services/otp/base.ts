export default abstract class OTPService {
    abstract send(): Promise<void>;
    abstract createVerificationSession(uniqueValue: string): Promise<string>;
}