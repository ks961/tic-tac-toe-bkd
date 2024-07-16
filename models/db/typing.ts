import type pool from "config/database";

export type QueryOptions = {
    table: string;
    values: any[];
    conditionalColumns: string[];
    selectColumns?: string[],
}

export type PoolQueryReturnType = Awaited<ReturnType<typeof pool.query>>;