import pool, { type QueryResponse } from "config/database"
import type { PoolQueryReturnType, QueryOptions } from "./typing";
import { RuntimeError } from "typing/typing";
import type { QueryResult } from "mysql2";

export type QueryInfo<T> = {
    data: T,
    query: string,
    table: string,
}

export type QueryDataExists = {
    table: string,
    condition: string,
    columns: string[],
}


export function insertData<T>({ data, query, table}: QueryInfo<T>) {
    
}

export async function isDataExists<T>(columns: string[], condition: string, table: string, data: string[]) {
    const cols = columns.join(", ");
    
    const [rows, fields]: QueryResponse = await pool.query(`SELECT ${cols} FROM ${table} WHERE ${condition}`, data);
    
    return (rows as T[]);
}

export async function getDataFromDatabase(options: QueryOptions): Promise<QueryResult> {
    const { table, conditionalColumns, values, selectColumns } = options;
    
    if(conditionalColumns.length !== values.length) {
        throw new RuntimeError("Every Columns should have its corresponding Values.");
    }

    try {
        const queryText = `SELECT ${(selectColumns && selectColumns.length > 0) ? selectColumns.join(", ") : "*"} FROM ${table} WHERE ${conditionalColumns.map(col => `${col} = ?`).join(' AND ')}`;       
        const [ rows ] = await pool.query(queryText, values);
        return rows;
    } catch (error) {
        throw error;
        // Handle error appropriately, e.g., log it
    }
}