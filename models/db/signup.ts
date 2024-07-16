import pool, { TABLES } from "config/database";
import type { UserDTO } from "models/DTOs/signup";
import { RuntimeError } from "typing/typing";
import { hashify, isDevEnvironment, validateEmail } from "utils";


export async function insertUserData(user: UserDTO) {
    try {
        await pool.query(
            `INSERT INTO ${TABLES.users} (playerId, username, email, password) VALUES (?, ?, ?, ?)`, 
            [user.playerId, user.username, user.email, user.hashedPassword]);
    } catch(err) {
        throw new  RuntimeError(
            isDevEnvironment() ? 
                (err as Error).message : 
            "Something went wrong while registering user.", 500);
    }
}

export async function updatePassword(identifier: string, hashedPassword: string) {
    const identifierCol = validateEmail(identifier) ? "email" : "username";

    try {
        await pool.query(
            `UPDATE ${TABLES.users} SET password = ? WHERE ${identifierCol} = ?`,
            [hashedPassword, identifier]
        );
    } catch (err) {
        throw new  RuntimeError(
                isDevEnvironment() ? 
                    (err as Error).message : 
                "Something went wrong while updating Password", 500);
    }
}