import type { SingupCredentialDTO } from "./signup";

export type LoginCredentialDTO = Omit<SingupCredentialDTO, "username" | "email"> & {
    usernameOrEmail: string,
};

export type UserIndentifierDTO = Pick<LoginCredentialDTO, "usernameOrEmail">;

export type OtpVerificationDTO = {
    otp: number,
    sessionId: string,
}

export type UpdatePasswordDTO = {
    password: string,
    updateToken: string,
}