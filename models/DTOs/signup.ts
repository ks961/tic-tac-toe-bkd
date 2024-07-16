export type SingupCredentialDTO = {
    username: string,
    email: string,
    password: string,
}


export type UserDTO = Omit<SingupCredentialDTO, "password"> & {
    playerId: string,
    hashedPassword: string,
}

export type UserExistsQueryDTO = Omit<UserDTO, "playerId" | "hashedPassword">;

export type PlayerInfoDTO = Pick<UserDTO, "playerId" | "username">;

export function SingupCredentialToUserDTO(creds: SingupCredentialDTO, otherProperties?: Partial<UserDTO>) {
    const { password, ...rest } = creds;

    if(!otherProperties) return rest as UserDTO;

    const user = {
        ...rest,
        ...otherProperties
    }

    return user as UserDTO;
}

export function SingupCredentialToUserExistsQueryDTO(creds: SingupCredentialDTO, otherProperties?: Partial<UserDTO>) {
    const { password, ...rest } = creds;

    if(!otherProperties) return rest as UserExistsQueryDTO;

    const user = {
        ...rest,
        ...otherProperties
    }

    return user as UserDTO;
}

export function UserToUserExistsQueryDTO(creds: UserDTO, otherProperties?: Partial<UserDTO>) {
    const { hashedPassword, playerId, ...rest } = creds;

    if(!otherProperties) return rest as UserExistsQueryDTO;

    const user = {
        ...rest,
        ...otherProperties
    }

    return user as UserDTO;
}