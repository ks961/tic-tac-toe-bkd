import crypto from "crypto";

export function isDevEnvironment() {
    return process.env.ENV === "development";
}

export function hashify(text: string) {
    const hash = crypto.createHash("sha256").update(text).digest("hex");
    return hash;
}

export const fromHourToMillisec = (hours: number) => hours * 3600 * 1000;
export const fromMintueToMillisec = (minutes: number) => (minutes * 60) * 1000;

export function currentTimeInUTC() {
    return new Date().toUTCString();
}

export function checkRegex(pattern: string | RegExp, inputString: string) {
    let regex = new RegExp(pattern);
    
    return regex.test(inputString);
}

export function validateEmail(value: string): boolean {
    const isOK = checkRegex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", value);
    
    return isOK;
}

export function dateToSeconds(dateTime: Date) {
    return Math.floor(dateTime.getTime() / 1000);
}

export function popSet<T>(set: Set<T>): T | undefined {

    const value: (T | undefined) = set.values().next().value;

    if(value !== undefined) {
        set.delete(value);
    }

    return value;
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSafeOtp() {
    const value = crypto.randomInt(100000, 999999);
    return value;
}