import { isDevEnvironment } from "utils";


export const protocol = "http";
export const frontendDomain = isDevEnvironment() ? "localhost" : "tictactoe.sudhanshu.io";

export const frontendUrl = `${protocol}://${frontendDomain}`;