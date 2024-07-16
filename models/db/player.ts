import { TABLES } from "config/database";
import type { PlayerInfoDTO } from "models/DTOs/signup";
import { isDevEnvironment, validateEmail } from "utils";
import { isDataExists } from "./generic";
import { RuntimeError } from "typing/typing";



export async function getPlayerIdByEmailOrUsername(usernameOrEmail: string): Promise<PlayerInfoDTO> {
    const isEmail = validateEmail(usernameOrEmail);
    const field = isEmail ? "email" : "username";

    try {
        const rows = await isDataExists<PlayerInfoDTO>(
            ["playerId", "username"], 
            `${field} = ?`, 
            TABLES.users, 
            [usernameOrEmail]
        );
        
        const isExists = (rows.length === 1);

        if(!isExists)
            throw new RuntimeError("User doesn't exists");

        return (rows[0] as PlayerInfoDTO);

    } catch(err: unknown) {

        if(err instanceof RuntimeError) {
            
            throw new Error(err.message);
        }

        throw new Error(isDevEnvironment() ? 
        (err as Error).message : "Something went wrong!");
    }
}