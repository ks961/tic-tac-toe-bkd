import mysql2, { type FieldPacket, type QueryResult } from "mysql2";

export type QueryResponse = Awaited<Promise<[QueryResult, FieldPacket[]]>>

export const TABLES = {
    users: "users",
}

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "db_tic_tac_toe"
}).promise();


export default pool;